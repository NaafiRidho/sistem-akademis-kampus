<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class DosenController extends Controller
{
    public function index(Request $request)
    {
        $query = Dosen::with('user');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nidn', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $dosen = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Admin/Dosen/Index', [
            'dosen' => $dosen,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return redirect()->route('admin.dosen.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nidn' => 'required|unique:dosen,nidn',
            'nama' => 'required|string|max:255',
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
                'role_id' => 2 // Dosen role
            ]);

            // Create dosen record
            Dosen::create([
                'user_id' => $user->id,
                'nidn' => $validated['nidn'],
                'nama' => $validated['nama'],
                'email' => $validated['email']
            ]);

            DB::commit();
            return redirect()->route('admin.dosen.index')
                ->with('success', 'Data dosen berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menambahkan data: ' . $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        return redirect()->route('admin.dosen.index');
    }

    public function update(Request $request, $id)
    {
        $dosen = Dosen::findOrFail($id);

        $validated = $request->validate([
            'nidn' => 'required|unique:dosen,nidn,' . $id,
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $dosen->user_id,
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

            $dosen->user->update($userData);

            // Update dosen record
            $dosen->update([
                'nidn' => $validated['nidn'],
                'nama' => $validated['nama'],
                'email' => $validated['email']
            ]);

            DB::commit();
            return redirect()->route('admin.dosen.index')
                ->with('success', 'Data dosen berhasil diupdate');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengupdate data: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $dosen = Dosen::findOrFail($id);
            $userId = $dosen->user_id;
            
            $dosen->delete();
            User::find($userId)->delete();

            DB::commit();
            return redirect()->route('admin.dosen.index')
                ->with('success', 'Data dosen berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus data: ' . $e->getMessage()]);
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Skip header row
            array_shift($rows);

            $imported = 0;
            $errors = [];

            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                try {
                    // Skip empty rows
                    if (empty($row[0])) continue;

                    // Validate required fields
                    if (empty($row[0]) || empty($row[1]) || empty($row[2])) {
                        $errors[] = "Baris " . ($index + 2) . ": Data tidak lengkap";
                        continue;
                    }

                    // Check if NIDN already exists
                    if (Dosen::where('nidn', $row[0])->exists()) {
                        $errors[] = "Baris " . ($index + 2) . ": NIDN {$row[0]} sudah ada";
                        continue;
                    }

                    // Create user
                    $user = User::create([
                        'name' => $row[1],
                        'email' => $row[3] ?? $row[0] . '@lecturer.ac.id',
                        'password' => Hash::make($row[4] ?? '12345678'),
                        'role_id' => 2
                    ]);

                    // Create dosen
                    Dosen::create([
                        'user_id' => $user->id,
                        'nidn' => $row[0],
                        'nama' => $row[1],
                        'email' => $row[2]
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            DB::commit();

            $message = "Berhasil mengimport {$imported} data dosen";
            if (!empty($errors)) {
                $message .= ". Terdapat " . count($errors) . " error";
            }

            return redirect()->route('admin.dosen.index')
                ->with('success', $message)
                ->with('import_errors', $errors);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengimport data: ' . $e->getMessage()]);
        }
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_dosen.csv"',
        ];

        $columns = ['NIDN', 'Nama', 'Email Dosen', 'Email Login', 'Password'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fputcsv($file, ['0012345678', 'Dr. John Doe', 'john.doe@university.ac.id', 'john@lecturer.ac.id', '12345678']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
