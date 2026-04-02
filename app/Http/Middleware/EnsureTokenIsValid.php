<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Token; // Pastikan model Token Anda di-import

class EnsureTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Cek apakah token_id ada di session. Jika tidak, arahkan kembali ke halaman awal.
        if (!session()->has('token_id')) {
            return redirect()->route('home')->withErrors([
                'token' => 'Sesi tes Anda telah berakhir atau tidak ditemukan. Silakan masukkan token'
            ]);
        }

        // Ambil token dari database
        $token = Token::find(session('token_id'));

        // 2. Cek validitas token dan statusnya
        if (!$token) {
            // Token tidak ditemukan di database (mungkin sudah dihapus atau ID salah)
            session()->forget(['token_id', 'test_type', 'participant_id']); // Bersihkan session
            return redirect()->route('home')->withErrors([
                'token' => 'Token tidak valid atau sudah tidak tersedia.'
            ]);
        }

        // 3. Cek apakah token sudah kadaluarsa
        if ($token->isExpired()) {
            session()->forget(['token_id', 'test_type', 'participant_id']); // Bersihkan session
            return redirect()->route('home')->withErrors([
                'token' => 'Token sudah kadaluarsa. Silakan hubungi administrator untuk mendapatkan token baru.'
            ]);
        }

        // Handle berdasarkan status token
        switch ($token->status) {
            case 'unused':
                // Jika token belum digunakan (setelah verifikasi awal)
                // Ini seharusnya hanya terjadi jika pengguna mencoba langsung ke biodata
                // tanpa melalui proses verifikasi token yang benar.
                // Atau token_id di sesi ada, tapi statusnya masih 'unused' (misal: refresh di token input setelah input)
                session()->forget(['token_id', 'test_type', 'participant_id']); // Bersihkan session
                return redirect()->route('home')->withErrors([
                    'token' => 'Token belum digunakan. Silakan masukkan kembali token Anda.'
                ]);
            case 'in_progress':
                // Jika token sedang dalam proses, izinkan akses ke halaman yang diminta
                // Di sini, Anda perlu mekanisme untuk mengarahkan ke tahap terakhir yang belum selesai
                // Namun, untuk middleware ini, kita hanya memastikan token valid dan sedang berjalan.
                // Logika pengarahan ke tahap terakhir akan ada di controller yang diproteksi.
                // Simpan juga participant_id ke session jika belum ada, terutama untuk kasus refresh
                if (!session()->has('participant_id') && $token->used_by) {
                    session(['participant_id' => $token->used_by]);
                }
                // Ensure test_type is also restored for session persistence
                if (!session()->has('test_type') && $token->test_type) {
                    session(['test_type' => $token->test_type]);
                }
                return $next($request);
            case 'used':
                // Jika token sudah digunakan (tes selesai)
                // PENGECUALIAN: Izinkan akses ke halaman finish-test agar notifikasi sukses muncul
                if ($request->routeIs('psikotest.finish-test') || 
                    $request->routeIs('psikotest.general-instructions') || 
                    $request->routeIs('psikotest.submit-all') ||
                    $request->routeIs('psikotest.logout') ||
                    $request->routeIs('psikotest.papi-test.mark-completed') ||
                    $request->routeIs('psikotest.kraepelin-test.mark-completed')) {
                    return $next($request);
                }

                session()->forget(['token_id', 'test_type', 'participant_id']); // Bersihkan session
                return redirect()->route('home')->withErrors([
                    'token' => 'Token ini sudah digunakan untuk menyelesaikan tes dan tidak bisa diakses lagi.'
                ]);
            default:
                // Status tidak dikenal, mungkin error
                session()->forget(['token_id', 'test_type', 'participant_id']); // Bersihkan session
                return redirect()->route('home')->withErrors([
                    'token' => 'Terjadi masalah dengan token Anda. Silakan coba lagi.'
                ]);
        }
    }
}