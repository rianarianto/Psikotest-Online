<?php

namespace App\Http\Controllers\Psikotest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Participant;

class InstructionController extends Controller
{
    // === METODE UNTUK INSTRUKSI PAPIKOSTICK ===
    /**
     * Menampilkan halaman instruksi PapiKostick.
     */
    public function showPapiInstructions(Request $request) // Ini metode baru
    {
        $participantId = $request->session()->get('participant_id');
        $participant = Participant::find($participantId);

        if (!$participant) {
            return redirect()->route('home')->withErrors([
                'session' => 'Data peserta tidak ditemukan. Silakan mulai kembali dari awal.'
            ]);
        }

        $participantData = [
            'id' => $participant->id,
            'name' => $participant->name,
            // tambahkan data participant lain yang mungkin relevan
        ];

        // Jalur komponen React sesuai struktur folder Anda: Psikotest/Papikostic/PapiInstructions.tsx
        return Inertia::render('Psikotest/Papikostic/papi-instructions', [
            'participant' => $participantData,
        ]);
    }

    // === METODE UNTUK INSTRUKSI KRAEPELIN ===
    /**
     * Menampilkan halaman instruksi Kraepelin.
     */
    public function showKraepelinInstructions(Request $request) // Ini metode baru
    {
        $participantId = $request->session()->get('participant_id');
        $participant = Participant::find($participantId);

        if (!$participant) {
            return redirect()->route('home')->withErrors([
                'session' => 'Data peserta tidak ditemukan. Silakan mulai kembali dari awal.'
            ]);
        }

        $participantData = [
            'id' => $participant->id,
            'name' => $participant->name,
        ];

        // Jalur komponen React sesuai struktur folder Anda: Psikotest/Kraepelin/KraepelinInstructions.tsx
        return Inertia::render('Psikotest/Kraepelin/KraepelinInstructions', [
            'participant' => $participantData,
        ]);
    }

    // === METODE UNTUK INSTRUKSI GABUNGAN (alltest) ===
    /**
     * Menampilkan halaman instruksi gabungan (PapiKostick & Kraepelin).
     */
    public function showAllInstructions(Request $request) // Ini metode baru
    {
        $participantId = $request->session()->get('participant_id');
        $participant = Participant::find($participantId);

        if (!$participant) {
            return redirect()->route('home')->withErrors([
                'session' => 'Data peserta tidak ditemukan. Silakan mulai kembali dari awal.'
            ]);
        }

        $participantData = [
            'id' => $participant->id,
            'name' => $participant->name,
        ];

        // Jalur komponen React untuk instruksi gabungan.
        // Anda perlu membuat file ini: resources/js/Pages/Psikotest/CombinedInstructions.tsx
        return Inertia::render('Psikotest/CombinedInstructions', [
            'participant' => $participantData,
            'testType' => 'alltest', // Menambahkan testType sebagai prop, mungkin berguna di frontend
        ]);
    }

    // Catatan: Metode `show()` yang lama di atas (yang Anda tunjukkan) sekarang bisa dihapus,
    // karena tidak ada rute yang akan menunjuk kepadanya lagi setelah perubahan di web.php.
    // Jika Anda menghapusnya, pastikan juga untuk menghapus semua komentar terkait `switch` statement
    // yang tidak relevan lagi.
}