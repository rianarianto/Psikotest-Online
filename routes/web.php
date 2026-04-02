<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Psikotest\TokenController;
use App\Http\Controllers\Psikotest\BiodataController;
use App\Http\Controllers\Psikotest\InstructionController;
use App\Http\Controllers\Psikotest\PapiTestController;
use App\Http\Controllers\Psikotest\GeneralInstructionController;
use App\Http\Controllers\Psikotest\KraepelinTestController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\GenerateTokenController;
use App\Http\Controllers\Admin\ParticipantController;
use App\Http\Controllers\Admin\PapikostickAdminController;
use App\Models\Participant;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// =========================
// Public Routes
// =========================
Route::post('/psikotest/logout', [TokenController::class, 'logout'])->name('psikotest.logout');

Route::get('/', function (\Illuminate\Http\Request $request) {
     // 0. Jika User Terautentikasi (Admin/HR), berikan akses langsung ke halaman input token (untuk testing/manajemen)
     // tanpa dipaksa redirect berdasarkan session token psikotest.
     if (auth()->check()) {
          return Inertia::render('Psikotest/TokenInput');
     }

     // Auto-redirect jika sesi masih ada atau bisa dipulihkan dari cookie
     $tokenId = session('token_id');
     $cookieToken = $request->cookie('psikotest_token');

     if (!$tokenId && $cookieToken) {
          $token = \App\Models\Token::where('token', $cookieToken)->first();
          if ($token && !$token->isExpired() && $token->status === 'in_progress' && $token->used_by) {
               session([
                    'token_id' => $token->id,
                    'test_type' => $token->test_type,
                    'participant_id' => $token->used_by
               ]);
               $tokenId = $token->id;
          }
     }

     if ($tokenId) {
          $token = \App\Models\Token::find($tokenId);
          $participant = \App\Models\Participant::find(session('participant_id'));
          
          if ($token && $participant) {
               // Jika token sudah 'used', jangan redirect ke home (loop), tapi bersihkan session dan tampilkan form
               if ($token->status === 'used') {
                    session()->forget(['token_id', 'test_type', 'participant_id']);
                    return Inertia::render('Psikotest/TokenInput', [
                         'errors' => ['token' => 'Token ini sudah digunakan.']
                    ]);
               }

               $testInProgress = $participant->getTestInProgress();
               if ($testInProgress) {
                    $testCode = $testInProgress->testType->code ?? null;
                    if ($testCode === 'papi') return redirect()->route('psikotest.papi-test');
                    if ($testCode === 'kraepelin') return redirect()->route('psikotest.kraepelin-test');
               }
               
               // Jika belum selesai tapi tidak ada yang in-progress, ke hub
               return redirect()->route('psikotest.general-instructions');
          }
     }

     return Inertia::render('Psikotest/TokenInput');
})->name('home');

Route::post('/psikotest/verify-token', [TokenController::class, 'verify'])->name('psikotest.verify-token');


// =========================
// Authenticated Routes (untuk Dashboard Admin)
// =========================
Route::middleware(['auth', 'verified'])->group(function () {
     Route::get('/dashboard', [AdminDashboardController::class, 'showSummary'])
          ->name('dashboard');

     // Token Management
     Route::get('/admin/tokens', [GenerateTokenController::class, 'index'])->name('admin.tokens.index');
     Route::post('/admin/tokens', [GenerateTokenController::class, 'store'])->name('admin.tokens.store');
     Route::delete('/admin/tokens/{token}', [GenerateTokenController::class, 'destroy'])->name('admin.tokens.destroy');

     // Participant Management
     Route::get('/admin/participants', [ParticipantController::class, 'index'])->name('admin.participants.index');

     // PapiKostick Admin
     Route::get('/admin/papikostick', [PapikostickAdminController::class, 'index'])->name('admin.papikostick.index');
     Route::get('/admin/papikostick/{participant}/results', [PapikostickAdminController::class, 'showResult'])->name('admin.papikostick.showResult');
     Route::get('/admin/papikostick/settings', [PapikostickAdminController::class, 'settingsIndex'])->name('admin.papikostick.settings');
     Route::put('/admin/papikostick/questions/{papiQuestion}', [PapikostickAdminController::class, 'updateQuestion'])->name('admin.papikostick.updateQuestion');
});


// =========================
// Psikotest Routes (Token Valid)
// =========================
Route::middleware(['web', 'token.valid'])->group(function () {
     // Biodata
     Route::get('/psikotest/biodata', [BiodataController::class, 'show'])
          ->name('psikotest.biodata');
     Route::post('/psikotest/biodata', [BiodataController::class, 'store'])
          ->name('psikotest.biodata.store');

     // General Instructions (Hub)
     Route::get('/psikotest/general-instructions', [GeneralInstructionController::class, 'show'])
          ->name('psikotest.general-instructions');
     Route::post('/psikotest/submit-all', [GeneralInstructionController::class, 'submitAll'])
          ->name('psikotest.submit-all');

     // Instruksi per Tes
     Route::get('/psikotest/papi-instructions', [InstructionController::class, 'showPapiInstructions'])
          ->name('psikotest.papi-instructions');
     Route::get('/psikotest/kraepelin-instructions', [InstructionController::class, 'showKraepelinInstructions'])
          ->name('psikotest.kraepelin-instructions');

     // Tes PapiKostick
     Route::get('/psikotest/papi-test', [PapiTestController::class, 'show'])
          ->name('psikotest.papi-test');
     Route::post('/psikotest/papi-test/save-single-answer', [PapiTestController::class, 'saveSingleAnswer'])
          ->name('psikotest.papi-test.save-single-answer');
     Route::post('/psikotest/papi-test/mark-completed', [PapiTestController::class, 'markCompleted'])
          ->name('psikotest.papi-test.mark-completed');

     // Tes Kraepelin
     Route::get('/psikotest/kraepelin-test', [KraepelinTestController::class, 'show'])
          ->name('psikotest.kraepelin-test');
     Route::post('/psikotest/kraepelin-test/save-answer', [KraepelinTestController::class, 'saveAnswer'])
          ->name('psikotest.kraepelin-test.save-answer');
     Route::post('/psikotest/kraepelin-test/next-minute', [KraepelinTestController::class, 'nextMinute'])
          ->name('psikotest.kraepelin-test.next-minute');
     Route::post('/psikotest/kraepelin-test/mark-completed', [KraepelinTestController::class, 'markCompleted'])
          ->name('psikotest.kraepelin-test.mark-completed');

});


// Other routes
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

