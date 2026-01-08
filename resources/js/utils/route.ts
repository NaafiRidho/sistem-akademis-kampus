declare global {
    interface Window {
        Ziggy?: any;
    }
}

export function route(name: string, params?: any, absolute?: boolean): string {
    // Fallback routes map
    const routes: { [key: string]: string } = {
        'dosen.jadwal.index': '/dosen/jadwal',
        'dosen.kelas.index': '/dosen/kelas',
        'dosen.kelas.mahasiswa': '/dosen/kelas/:id/mahasiswa',
        'dosen.dashboard': '/dosen/dashboard',
    };
    
    let url = routes[name] || '/';
    
    // Handle params
    if (params) {
        if (typeof params === 'object' && !Array.isArray(params)) {
            // Replace :key with actual values
            Object.keys(params).forEach(key => {
                url = url.replace(`:${key}`, String(params[key]));
            });
        } else {
            // Single param assumes it's id
            url = url.replace(':id', String(params));
        }
    }
    
    return url;
}
