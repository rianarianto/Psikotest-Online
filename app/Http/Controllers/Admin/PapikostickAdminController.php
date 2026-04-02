<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PapiQuestion;
use App\Models\PapiAnswer;
use App\Models\Participant;
use App\Models\KraepelinAnswer;
use App\Models\ParticipantTest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Collection;

// ... (Imports remain same)

class PapikostickAdminController extends Controller
{
    // ... (Constants remain same)
    const PAPI_KOSTICK_TRAITS = [
        'N' => ['name' => 'Menyelesaikan Tugas Pribadi', 'description' => 'Mengukur dorongan untuk menyelesaikan tanggung jawab secara mandiri dan konsisten.'],
        'G' => ['name' => 'Peran Sebagai Pekerja Keras', 'description' => 'Mengukur tingkat dedikasi dan etos kerja dalam menyelesaikan tugas secara tuntas.'],
        'A' => ['name' => 'Hasrat Untuk Berprestasi', 'description' => 'Mengukur motivasi untuk mencapai keberhasilan dan menunjukkan kinerja unggul.'],
        'P' => ['name' => 'Mengendalikan / Mengarahkan Orang Lain', 'description' => 'Mengukur dorongan untuk mengambil alih kendali, memimpin, dan memberi instruksi kepada orang lain.'],
        'X' => ['name' => 'Mendapatkan Perhatian', 'description' => 'Mengukur kebutuhan untuk diakui, menarik perhatian, dan menjadi pusat dalam lingkungan sosial.'],
        'L' => ['name' => 'Peranan Sebagai Pemimpin', 'description' => 'Mengukur kecenderungan untuk tampil sebagai pemimpin dalam kelompok dan situasi kerja.'],
        'I' => ['name' => 'Mudah Membuat Keputusan', 'description' => 'Mengukur kemampuan untuk bersikap tegas, cepat mengambil keputusan, dan bertindak mandiri.'],
        'S' => ['name' => 'Pergaulan Luas', 'description' => 'Mengukur kecenderungan untuk menjalin hubungan sosial yang aktif dan luas.'],
        'V' => ['name' => 'Stamina', 'description' => 'Mengukur daya tahan dalam menyelesaikan pekerjaan dalam jangka waktu panjang.'],
        'K' => ['name' => 'Agresifitas', 'description' => 'Mengukur keberanian, ketegasan, dan dorongan untuk bersaing secara aktif.'],
        'B' => ['name' => 'Kebutuhan Terhadap Kelompok', 'description' => 'Mengukur sejauh mana seseorang merasa nyaman dan membutuhkan dukungan kelompok.'],
        'Z' => ['name' => 'Hasrat Untuk Berubah', 'description' => 'Mengukur keinginan untuk mencoba hal baru, mencari tantangan, dan keluar dari rutinitas.'],
        'D' => ['name' => 'Suka Pekerjaan yang Terperinci', 'description' => 'Mengukur preferensi terhadap tugas-tugas yang memerlukan ketelitian dan perhatian terhadap detail.'],
        'C' => ['name' => 'Suka Pekerjaan yang Teratur', 'description' => 'Mengukur kecenderungan terhadap keteraturan, struktur, dan kepatuhan pada prosedur.'],
        'R' => ['name' => 'Tipe Teoritis', 'description' => 'Mengukur ketertarikan pada ide-ide abstrak, pemikiran logis, dan pendekatan konseptual.'],
        'O' => ['name' => 'Kebtutuhan Mendekati dan Menyayangi', 'description' => 'Mengukur dorongan untuk membentuk hubungan yang hangat, dekat, dan penuh kasih sayang.'],
        'T' => ['name' => 'Tempo Kerja', 'description' => 'Mengukur kecepatan dan ritme kerja dalam menyelesaikan tugas sehari-hari.'],
        'E' => ['name' => 'Pengendalian Emosi', 'description' => 'Mengukur kemampuan untuk tetap tenang, stabil, dan mengelola emosi dalam berbagai situasi.'],
        'F' => ['name' => 'Dukungan Untuk Atasan', 'description' => 'Mengukur kecenderungan untuk bekerja sama, mengikuti arahan, dan setia kepada atasan.',],
        'W' => ['name' => 'Kebutuhan Untuk Taat Aturan Dan Arahan', 'description' => 'Mengukur tingkat kepatuhan terhadap norma, peraturan, dan instruksi kerja.'],
    ];

    public function index()
    {
        $participantsWithPapiResults = Participant::where('papi_test_status', 'completed')
            ->orWhereHas('papiAnswers')
            ->withCount('papiAnswers')
            ->get();

        return Inertia::render('Psikotest/Admin/PapikostickResult', [
            'participants' => $participantsWithPapiResults,
            'traitsList' => array_keys(self::PAPI_KOSTICK_TRAITS),
        ]);
    }

    public function settingsIndex()
    {
        $questions = PapiQuestion::select('id', 'statement_a', 'choice_a_trait', 'statement_b', 'choice_b_trait')->orderBy('id', 'asc')->get();
        $questions->map(function ($question) {
            $question->is_completed = !empty($question->statement_a) && !empty($question->choice_a_trait) && !empty($question->statement_b) && !empty($question->choice_b_trait);
            return $question;
        });
        return Inertia::render('Psikotest/Admin/PapikostickQuestionManagement', ['questions' => $questions]);
    }

    public function updateQuestion(Request $request, PapiQuestion $papiQuestion)
    {
        $validator = Validator::make($request->all(), [
            'statement_a' => ['required', 'string', 'max:255'],
            'choice_a_trait' => ['required', 'string', 'max:10'],
            'statement_b' => ['required', 'string', 'max:255'],
            'choice_b_trait' => ['required', 'string', 'max:10'],
        ]);

        if ($validator->fails()) {
            return Inertia::render('Psikotest/Admin/PapikostickQuestionManagement', ['errors' => $validator->errors(), 'formData' => $request->all()]);
        }

        try {
            DB::beginTransaction();
            $papiQuestion->update($validator->validated());
            DB::commit();
            return redirect()->route('admin.papikostick.settings', [], 303)->with('success', 'Soal berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Inertia::render('Psikotest/Admin/PapikostickQuestionManagement', ['errors' => ['general' => 'Gagal memperbarui soal: ' . $e->getMessage()], 'formData' => $request->all()]);
        }
    }

    public function showResult(Participant $participant)
    {
        // Papi Data
        $answers = PapiAnswer::where('participant_id', $participant->id)->with('question')->get();
        $traitScores = $this->calculateTraitScores($answers);
        $papiKostickTraitsDetails = self::PAPI_KOSTICK_TRAITS;

        // Kraepelin Data
        $kraepelinAnswers = KraepelinAnswer::where('participant_id', $participant->id)->get();
        $kraepelinChartData = [];
        $kraepelinTotalCorrect = 0;

        if ($kraepelinAnswers->count() > 0) {
            $groupedByMinute = $kraepelinAnswers->groupBy('minute_number');
            $totalMinutes = \App\Http\Controllers\Psikotest\KraepelinTestController::TOTAL_MINUTES; // Use dynamic constant

            for ($i = 1; $i <= $totalMinutes; $i++) {
                $minuteAnswers = $groupedByMinute->get($i);
                $answeredCount = $minuteAnswers ? $minuteAnswers->whereNotNull('user_answer')->count() : 0;
                $correctCount = $minuteAnswers ? $minuteAnswers->where('is_correct', true)->count() : 0;
                $incorrectCount = $minuteAnswers ? $minuteAnswers->whereNotNull('user_answer')->where('is_correct', false)->count() : 0;

                // Extract answer pattern (sorted by question index)
                // 1 = Correct, 0 = Incorrect, null = Not answered (should not happen if we filter whereNotNull user_answer but good to be safe)
                $answerPattern = $minuteAnswers
                    ? $minuteAnswers->whereNotNull('user_answer')
                        ->sortBy('question_index')
                        ->pluck('is_correct')
                        ->map(fn($val) => (bool) $val)
                        ->values()
                        ->toArray()
                    : [];

                $kraepelinChartData[] = [
                    'minute' => $i,
                    'total_answered' => $answeredCount,
                    'correct_count' => $correctCount,
                    'incorrect_count' => $incorrectCount,
                    'answer_pattern' => $answerPattern,
                ];
                $kraepelinTotalCorrect += $correctCount;
            }
        }

        return Inertia::render('Psikotest/Admin/PapikostickResultDetail', [
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
                'email' => $participant->email,
                'age' => $participant->age,
                'position' => $participant->position,
                'institution' => $participant->institution,
                'papi_test_status' => $participant->papi_test_status,
                'papi_test_started_at' => $participant->papi_test_started_at ? $participant->papi_test_started_at->toIso8601String() : null,
                'test_completed_at' => $participant->test_completed_at ? $participant->test_completed_at->toIso8601String() : null,
                'token_type' => $participant->token ? $participant->token->test_type : null,
            ],
            'traitScores' => $traitScores,
            'traitsDetails' => $papiKostickTraitsDetails,
            'answers' => $answers->map(function ($answer) {
                return [
                    'question_id' => $answer->question_id,
                    'chosen_option' => $answer->answer,
                    'statement_a' => $answer->question->statement_a,
                    'statement_b' => $answer->question->statement_b,
                    'choice_a_trait' => $answer->question->choice_a_trait,
                    'choice_b_trait' => $answer->question->choice_b_trait,
                ];
            })->toArray(),
            'kraepelinData' => [
                'chartData' => $kraepelinChartData,
                'totalCorrect' => $kraepelinTotalCorrect,
                'hasData' => $kraepelinAnswers->count() > 0,
            ],
        ]);
    }

    private function calculateTraitScores(Collection $answers): array
    {
        $scores = array_fill_keys(array_keys(self::PAPI_KOSTICK_TRAITS), 0);
        foreach ($answers as $answer) {
            if ($answer->question) {
                if ($answer->answer === 'A' && $answer->question->choice_a_trait)
                    $scores[$answer->question->choice_a_trait]++;
                elseif ($answer->answer === 'B' && $answer->question->choice_b_trait)
                    $scores[$answer->question->choice_b_trait]++;
            }
        }
        return $scores;
    }
}
