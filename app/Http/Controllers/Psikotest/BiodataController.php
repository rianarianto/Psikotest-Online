<?php

namespace App\Http\Controllers\Psikotest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Participant;
use App\Models\Token;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BiodataController extends Controller
{
    /**
     * Menampilkan formulir biodata.
     */
    public function show()
    {
        return Inertia::render('Psikotest/BiodataForm');
    }

    /**
     * Menyimpan data biodata peserta.
     */
    public function store(Request $request)
    {
        $tokenId = session('token_id');
        if (!$tokenId) {
            return redirect()->route('home')->withErrors(['token' => 'Sesi token tidak ditemukan.']);
        }

        $token = Token::find($tokenId);
        if (!$token || $token->status !== 'in_progress' || $token->used_by !== null) {
            return redirect()->route('home')->withErrors(['token' => 'Token ini sudah digunakan atau tidak valid.']);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:participants'],
            'age' => ['required', 'integer', 'min:18', 'max:100'],
            'position' => ['required', 'string', 'max:255'],
            'institution' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        DB::beginTransaction();
        try {
            $participant = Participant::create([
                'name' => $request->name,
                'email' => $request->email,
                'age' => $request->age,
                'position' => $request->position,
                'institution' => $request->institution,
                'token_id' => $tokenId,
            ]);

            // Update token
            $token->update(['used_by' => $participant->id]);

            session(['participant_id' => $participant->id]);

            DB::commit();

            // Redirect ke General Instructions (hub utama)
            return redirect()->route('psikotest.general-instructions');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('BiodataController@store: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menyimpan biodata. Silakan coba lagi.']);
        }
    }
}

