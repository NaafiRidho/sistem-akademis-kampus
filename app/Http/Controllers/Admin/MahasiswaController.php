<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MahasiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Mahasiswa::with(['prodi.fakultas', 'user', 'kelas']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nim', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%");
            });
        }

        // Filter by prodi
        if ($request->has('prodi_id') && $request->prodi_id) {
            $query->where('prodi_id', $request->prodi_id);
        }

        $mahasiswa = $query->orderBy('created_at', 'desc')->paginate(15);
        $prodis = Prodi::with('fakultas')->get();
        $kelas = \App\Models\Kelas::with('prodi')->orderBy('nama_kelas')->get();

        // Log untuk debugging di production (bisa dihapus setelah fix)
        Log::info('Mahasiswa Controller - Data Count', [
            'mahasiswa_count' => $mahasiswa->total(),
            'prodis_count' => $prodis->count(),
            'kelas_count' => $kelas->count(),
            'kelas_sample' => $kelas->take(3)->map(fn($k) => [
                'id' => $k->id,
                'nama' => $k->nama_kelas,
                'prodi_id' => $k->prodi_id,
                'prodi_id_type' => gettype($k->prodi_id)
            ])
        ]);

        return Inertia::render('Admin/Mahasiswa/Index', [
            'mahasiswa' => $mahasiswa,
            'prodis' => $prodis,
            'kelas' => $kelas ?? [], // Fallback ke array kosong
            'filters' => $request->only(['search', 'prodi_id'])
        ]);
    }

    public function create()
    {
        return redirect()->route('admin.mahasiswa.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nim' => 'required|unique:mahasiswa,nim',
            'nama' => 'required|string|max:255',
            'prodi_id' => 'required|exists:prodi,id',
            'kelas_id' => 'nullable|exists:kelas,id',
            'angkatan' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'nullable|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8'
        ]);

        DB::beginTransaction();
        try {
            // Create user account
            $user = User::create([
                'name' => $validated['nama'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role_id' => 3 // Mahasiswa role
            ]);

            // Create mahasiswa record
            Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $validated['nim'],
                'nama' => $validated['nama'],
                'prodi_id' => $validated['prodi_id'],
                'kelas_id' => $validated['kelas_id'] ?? null,
                'angkatan' => $validated['angkatan'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'alamat' => $validated['alamat']
            ]);

            DB::commit();
            return redirect()->route('admin.mahasiswa.index')
                ->with('success', 'Data mahasiswa berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menambahkan data: ' . $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        return redirect()->route('admin.mahasiswa.index');
    }

    public function update(Request $request, $id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $validated = $request->validate([
            'nim' => 'required|unique:mahasiswa,nim,' . $id,
            'nama' => 'required|string|max:255',
            'prodi_id' => 'required|exists:prodi,id',
            'kelas_id' => 'nullable|exists:kelas,id',
            'angkatan' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'nullable|string',
            'email' => 'required|email|unique:users,email,' . $mahasiswa->user_id,
            'password' => 'nullable|min:8'
        ]);

        DB::beginTransaction();
        try {
            // Update user account
            $userData = [
                'name' => $validated['nama'],
                'email' => $validated['email']
            ];

            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }

            $mahasiswa->user->update($userData);

            // Update mahasiswa record
            $mahasiswa->update([
                'nim' => $validated['nim'],
                'nama' => $validated['nama'],
                'prodi_id' => $validated['prodi_id'],
                'kelas_id' => $validated['kelas_id'] ?? null,
                'angkatan' => $validated['angkatan'],
                'jenis_kelamin' => $validated['jenis_kelamin'],
                'alamat' => $validated['alamat']
            ]);

            DB::commit();
            return redirect()->route('admin.mahasiswa.index')
                ->with('success', 'Data mahasiswa berhasil diupdate');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengupdate data: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $mahasiswa = Mahasiswa::findOrFail($id);
            $userId = $mahasiswa->user_id;
            
            $mahasiswa->delete();
            User::find($userId)->delete();

            DB::commit();
            return redirect()->route('admin.mahasiswa.index')
                ->with('success', 'Data mahasiswa berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus data: ' . $e->getMessage()]);
        }
    }

    public function import(Request $request)
    {
        Log::info('Import request received');
        Log::info('Has file: ' . ($request->hasFile('file') ? 'yes' : 'no'));
        
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            Log::info('File details - Name: ' . $file->getClientOriginalName() . ', Extension: ' . $file->getClientOriginalExtension() . ', MIME: ' . $file->getMimeType());
        }
        
        try {
            $request->validate([
                'file' => 'required|file|max:10240'
            ]);
            
            // Manual validation for file extension
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            
            if (!in_array($extension, ['xlsx', 'xls', 'csv'])) {
                return back()->with('error', 'File harus berformat Excel (.xlsx, .xls) atau CSV (.csv). File Anda: .' . $extension);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ' . json_encode($e->errors()));
            return back()->with('error', 'Validasi gagal: ' . implode(', ', $e->validator->errors()->all()));
        }

        try {
            $file = $request->file('file');
            Log::info('Import file received: ' . $file->getClientOriginalName());
            
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            Log::info('Total rows in file: ' . count($rows));

            // Skip header row
            array_shift($rows);

            $imported = 0;
            $errors = [];

            // Validate data exists
            if (empty($rows)) {
                Log::warning('No data rows found in file');
                return back()->with('error', 'File tidak berisi data');
            }

            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                try {
                    Log::info("Processing row " . ($index + 2) . ": " . json_encode($row));
                    
                    // Skip completely empty rows
                    if (empty(array_filter($row))) {
                        Log::info("Skipping empty row " . ($index + 2));
                        continue;
                    }

                    // Validate required fields
                    if (empty($row[0]) || empty($row[1]) || empty($row[2])) {
                        $error = "Baris " . ($index + 2) . ": Data tidak lengkap (NIM, Nama, atau Prodi ID kosong)";
                        Log::warning($error);
                        $errors[] = $error;
                        continue;
                    }

                    // Check if NIM already exists
                    if (Mahasiswa::where('nim', $row[0])->exists()) {
                        $error = "Baris " . ($index + 2) . ": NIM {$row[0]} sudah ada";
                        Log::warning($error);
                        $errors[] = $error;
                        continue;
                    }

                    // Validate prodi exists
                    if (!Prodi::find($row[2])) {
                        $error = "Baris " . ($index + 2) . ": Prodi ID {$row[2]} tidak ditemukan";
                        Log::warning($error);
                        $errors[] = $error;
                        continue;
                    }

                    // Check if email already exists
                    $email = $row[5] ?? $row[0] . '@student.ac.id';
                    if (User::where('email', $email)->exists()) {
                        $error = "Baris " . ($index + 2) . ": Email {$email} sudah digunakan";
                        Log::warning($error);
                        $errors[] = $error;
                        continue;
                    }

                    // Create user
                    $user = User::create([
                        'name' => $row[1],
                        'email' => $email,
                        'password' => Hash::make($row[6] ?? '12345678'),
                        'role_id' => 3
                    ]);

                    // Create mahasiswa
                    // Format Excel: NIM, Nama, Prodi_ID, Angkatan, Jenis_Kelamin, Email(optional), Password(optional), Alamat(optional), Kelas_ID(optional)
                    Mahasiswa::create([
                        'user_id' => $user->id,
                        'nim' => $row[0],
                        'nama' => $row[1],
                        'prodi_id' => $row[2],
                        'kelas_id' => !empty($row[8]) ? $row[8] : null,
                        'angkatan' => $row[3] ?? date('Y'),
                        'jenis_kelamin' => $row[4] ?? 'L',
                        'alamat' => $row[7] ?? null
                    ]);

                    $imported++;
                    Log::info("Successfully imported row " . ($index + 2));
                } catch (\Exception $e) {
                    $error = "Baris " . ($index + 2) . ": " . $e->getMessage();
                    Log::error($error);
                    $errors[] = $error;
                }
            }

            DB::commit();

            Log::info("Import completed. Imported: {$imported}, Errors: " . count($errors));

            if ($imported === 0 && !empty($errors)) {
                return redirect()->route('admin.mahasiswa.index')
                    ->with('error', 'Gagal mengimport data. ' . implode(', ', array_slice($errors, 0, 3)));
            }

            $message = "Berhasil mengimport {$imported} data mahasiswa";
            if (!empty($errors)) {
                $message .= ". Terdapat " . count($errors) . " error";
            }

            Log::info('Redirecting with flash message: ' . $message);

            return redirect()->route('admin.mahasiswa.index')
                ->with([
                    'success' => $message,
                    'import_errors' => $errors
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.mahasiswa.index')
                ->with('error', 'Gagal mengimport data: ' . $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_mahasiswa.csv"',
        ];

        $columns = ['NIM', 'Nama', 'Prodi ID', 'Angkatan', 'Jenis Kelamin (L/P)', 'Email', 'Password', 'Alamat', 'Kelas ID'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fputcsv($file, ['2024001', 'John Doe', '1', '2024', 'L', 'john@student.ac.id', '12345678', 'Jl. Example No. 1', '1']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
