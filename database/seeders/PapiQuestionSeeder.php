<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\PapiQuestion; // Pastikan model PapiQuestion diimport

class PapiQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Menonaktifkan foreign key checks sementara
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Hapus semua data lama sebelum menyisipkan yang baru
        // Menggunakan truncate() yang lebih cepat untuk membersihkan tabel
        PapiQuestion::truncate();

        $questionsData = [
            // Soal 1
            [
                'statement_a' => "Saya seorang pekerja giat",
                'choice_a_trait' => null,
                'statement_b' => "Saya Bukan Seorang Pemurung",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 2
            [
                'statement_a' => "Saya suka bekerja lebih baik dari yang lain",
                'choice_a_trait' => null,
                'statement_b' => "Saya melakukan pekerjaan hingga tuntas",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 3
            [
                'statement_a' => "Saya suka memberi orang petunjuk bagaimana melakukan sesuatu.",
                'choice_a_trait' => null,
                'statement_b' => "Saya senang memberitahukan orang apa yang harus dikerjakan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 4
            [
                'statement_a' => "Saya suka melakukan atau mengatakan hal-hal lucu.",
                'choice_a_trait' => null,
                'statement_b' => "Saya senang memberitahukan orang apa yang harus dikerjakan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 5
            [
                'statement_a' => "Saya suka menggabungkan diri dalam kelompok",
                'choice_a_trait' => null,
                'statement_b' => "Saya ingin diperhatikan dalam kelompok.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 6
            [
                'statement_a' => "Saya suka Menjalin persahabatan",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka menggabungkan diri dalam suatu kelompok",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 7
            [
                'statement_a' => "Jika saya rasa perlu, saya bisa cepat menyesuaikan diri",
                'choice_a_trait' => null,
                'statement_b' => "Saya berusaha Menjalin persahabatan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 8
            [
                'statement_a' => "Saya akan membalas jika saya di sakiti",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka melakukan hal-hal baru dan berbeda",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 9
            [
                'statement_a' => "Saya ingin atasan menyukai saya",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka memberitahukan orang jika mereka bersalah.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 10
            [
                'statement_a' => "Saya suka mengikuti petunjuk yang di berikan kepada saya",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka membuat atasan senang",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 11
            [
                'statement_a' => "Saya berusaha keras sekali",
                'choice_a_trait' => null,
                'statement_b' => "Saya seorang yang rapih",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 12
            [
                'statement_a' => "Saya dapat membuat orang melakukan apa yang saya inginkan",
                'choice_a_trait' => null,
                'statement_b' => "Saya tidak mudah marah.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 13
            [
                'statement_a' => "Saya suka memberitahu kelompok apa yang harus mereka kerjakan.",
                'choice_a_trait' => null,
                'statement_b' => "Saya selalu melakukan pekerjaan sampai tuntas.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 14
            [
                'statement_a' => "Saya ingin menjadi orang yang menarik dan mengasyikan.",
                'choice_a_trait' => null,
                'statement_b' => "Saya ingin menjadi orang yang sangat berhasil",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 15
            [
                'statement_a' => "Saya ingin dapat menyesuaikan diri dengan kelompok-kelompok",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka membantu orang mengambil keputusan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 16
            [
                'statement_a' => "Saya cemas bila seseorang tidak menyukai saya",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka orang memperhatikan saya",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 17
            [
                'statement_a' => "Saya suka mencoba hal-hal baru",
                'choice_a_trait' => null,
                'statement_b' => "Saya lebih suka bekerja sama daripada bekerja Sendiri",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 18
            [
                'statement_a' => "Kadang-kadang saya menyalahkan orang lain jika ada yang tidak beres. ",
                'choice_a_trait' => null,
                'statement_b' => "Saya merasa terganggu bila ada yang tidak menyukai saya.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 19
            [
                'statement_a' => "Saya suka menyenangkan atasan",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka mencoba pekerjaan – pekerjaan yang baru dan berbeda.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 20
            [
                'statement_a' => "Saya menyukai petunjuk-petujuk yang rinci dalam menyelesaikan pekerjaan",
                'choice_a_trait' => null,
                'statement_b' => "Akan saya katakan kepada orang-orang yang bersangkutan bila mereka menjengkelkan saya",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 21
            [
                'statement_a' => "Saya selalu berusaha keras",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka Melaksanakan Setiap langkah dengan hati-hati",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 22
            [
                'statement_a' => "Saya akan menjadi seorang pemimpin yang baik",
                'choice_a_trait' => null,
                'statement_b' => "Saya dapat mengorganisir suatu pekerjaan dengan baik.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 23
            [
                'statement_a' => "saya mudah tersinggung",
                'choice_a_trait' => null,
                'statement_b' => "Saya lambat dalam membuat keputusan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 24
            [
                'statement_a' => "Saya suka mengerjakan beberapa pekerjaan sekaligus",
                'choice_a_trait' => null,
                'statement_b' => "Bila saya dalam kelompok, saya lebih sering sebagai pendengar.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 25
            [
                'statement_a' => "Saya sangat senang bila mendapat undangan",
                'choice_a_trait' => null,
                'statement_b' => "Saya ingin lebih baik dari yang lain dalam mengerjakan sesuatu.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 26
            [
                'statement_a' => "Saya suka Menjalin persahabatan",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka menasehati orang lain",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 27
            [
                'statement_a' => "Saya suka melakukan hal-hal baru dan berbeda",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka memberitahu bagaimana saya berhasil dalam melakukan sesuatu",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 28
            [
                'statement_a' => "Bila pendapat saya benar, saya akan pertahankan",
                'choice_a_trait' => null,
                'statement_b' => "Saya ingin diterima dan diakui dalam kelompok",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 29
            [
                'statement_a' => "Saya tak mau menjadi lain dari yang lain",
                'choice_a_trait' => null,
                'statement_b' => "Saya berusaha dekat dengan orang-orang",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 30
            [
                'statement_a' => "Saya senang memberitahu orang bagaimana melakukan suatu pekerjaan",
                'choice_a_trait' => null,
                'statement_b' => "Saya berusaha dekat dengan orang – orang",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 31
            [
                'statement_a' => "Saya bekerja keras",
                'choice_a_trait' => null,
                'statement_b' => "Saya banyak berfikir dan membuat perencanaan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 32
            [
                'statement_a' => "Saya memimpin kelompok",
                'choice_a_trait' => null,
                'statement_b' => "Saya tertarik dengan hal-hal yang lebih detail",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 33
            [
                'statement_a' => "Saya mengambil Keputusan dengan mudah dan cepat",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka Menjalin persahabatan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 34
            [
                'statement_a' => "Saya melakukan pekerjaan dengan cepat",
                'choice_a_trait' => null,
                'statement_b' => "Saya tidak sering marah atau sedih",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 35
            [
                'statement_a' => "Saya ingin menjadi bagian dari kelompok",
                'choice_a_trait' => null,
                'statement_b' => "Saya hanya ingin melakukan pekerjaan pada satu waktu",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 36
            [
                'statement_a' => "Saya berusaha Menjalin persahabatan",
                'choice_a_trait' => null,
                'statement_b' => "Saya berusaha keras menjadi yang terbaik",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 37
            [
                'statement_a' => "Saya suka mode terbaru untuk pakaian",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka di beri tanggungjawab.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 38
            [
                'statement_a' => "Saya menyukai perdebatan",
                'choice_a_trait' => null,
                'statement_b' => "Saya senang mendapat perhatian",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 39
            [
                'statement_a' => "Saya suka menyenangkan atasan",
                'choice_a_trait' => null,
                'statement_b' => "Saya tertarik menjadi bagian dalam kelompok",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 40
            [
                'statement_a' => "Saya sangat memperhatikan peraturan",
                'choice_a_trait' => null,
                'statement_b' => "Saya ingin orang mengenal saya dengan baik",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 41
            [
                'statement_a' => "Saya berusaha keras sekali",
                'choice_a_trait' => null,
                'statement_b' => "Saya sangat ramah",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 42
            [
                'statement_a' => "Orang berpendapat saya memimpin dengan baik",
                'choice_a_trait' => null,
                'statement_b' => "Saya berfikir lama dan berhati – hati",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 43
            [
                'statement_a' => "Bila ada kesempatan, saya akan memanfaatkan nya.",
                'choice_a_trait' => null,
                'statement_b' => "Saya senang menangani hal-hal kecil",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 44
            [
                'statement_a' => "Orang berpendapat bahwa saya bekerja cepat",
                'choice_a_trait' => null,
                'statement_b' => "Orang berpendapat bahwa saya rapi dan teratur",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 45
            [
                'statement_a' => "Saya senang mengikuti pertandingan dan berolahraga.",
                'choice_a_trait' => null,
                'statement_b' => "Saya memiliki kepribadian yang menyenangkan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 46
            [
                'statement_a' => "Saya senang jika orang dekat dan bersahabat dengan saya",
                'choice_a_trait' => null,
                'statement_b' => "Saya selalu berusaha menyelesaikan sesuatu yang telah saya mulai",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 47
            [
                'statement_a' => "Saya senang bereksperimen dan mencoba hal-hal baru",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka mengerjakan pekerjaan yang sulit-sulit",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 48
            [
                'statement_a' => "Saya suka diperlakukan dengan adil",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka memberitahu orang lain bagaimana Melaksanakan sesuatu.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 49
            [
                'statement_a' => "Saya suka melakukan apa yang diharapkan orang dari saya.",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka jika orang perduli terhadap saya",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 50
            [
                'statement_a' => "Saya suka diterangkan tugas saya sedetail-detailnya",
                'choice_a_trait' => null,
                'statement_b' => "Saya senang berada bersama orang-orang",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 51
            [
                'statement_a' => "Saya selalu berusaha menyelesaikan pekerjaan dengan sempurna.",
                'choice_a_trait' => null,
                'statement_b' => "Orang mengatakan bahwa saya hampir-hampir tidak pernah lelah.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 52
            [
                'statement_a' => "Saya tipe pemimpin",
                'choice_a_trait' => null,
                'statement_b' => "Saya mudah bergaul",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 53
            [
                'statement_a' => "Saya gunakan kesempatan",
                'choice_a_trait' => null,
                'statement_b' => "Saya banyak sekali berfikir",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 54
            [
                'statement_a' => "Saya bekerja dengan tempo yang tinggi dan mantap",
                'choice_a_trait' => null,
                'statement_b' => "Saya senang menangani detail suatu pekerjaan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 55
            [
                'statement_a' => "Saya memiliki banyak tenaga untuk kegiatan dan berolah raga.",
                'choice_a_trait' => null,
                'statement_b' => "Saya mengatur dan menyimpan barang dengan teratur dan rapi.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 56
            [
                'statement_a' => "Saya dapat bergaul baik dengan semua orang",
                'choice_a_trait' => null,
                'statement_b' => "Saya orang yang berwatak tenang",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 57
            [
                'statement_a' => "Saya ingin bertemu dengan orang-orang baru dan melakukan hal-hal baru.",
                'choice_a_trait' => null,
                'statement_b' => "Saya selalu ingin menyelesaikan pekerjaan yang telah saya mulai",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 58
            [
                'statement_a' => "Saya biasanya mempertahankan pendapat yang saya yakini.",
                'choice_a_trait' => null,
                'statement_b' => "Saya biasanya suka bekerja keras.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 59
            [
                'statement_a' => "Saya menyambut baik saran-saran dari orang yang saya kagumi.",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka bertanggung jawab terhadap orang lain",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 60
            [
                'statement_a' => "Saya membiarkan diri saya dipengaruhi dengan kuat oleh orang lain",
                'choice_a_trait' => null,
                'statement_b' => "Saya senang bila memperoleh banyak perhatian",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 61
            [
                'statement_a' => "Biasanya saya bekerja keras sekali.",
                'choice_a_trait' => null,
                'statement_b' => "Biasanya saya bekerja cepat",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 62
            [
                'statement_a' => "Apabila saya bicara, kelompok diam dan mendengarkan",
                'choice_a_trait' => null,
                'statement_b' => "Saya trampil menggunakan perkakas",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 63
            [
                'statement_a' => "Saya lambat dalam membuat persahabatan",
                'choice_a_trait' => null,
                'statement_b' => "Saya lambat dalam mengambil Keputusan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 64
            [
                'statement_a' => "Biasanya saya makan dengan cepat",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka membaca",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 65
            [
                'statement_a' => "Saya suka pekerjaan Dimana saya banyak bergerak",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka pekerjaan yang harus dilaksanakan dengan hati-hati",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 66
            [
                'statement_a' => "Saya mudah membuat sebanyak mungkin teman",
                'choice_a_trait' => null,
                'statement_b' => "Saya mudah menemukan kembali barang-barang yang saya simpan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 67
            [
                'statement_a' => "Saya membuat rencana jauh-jauh sebelumnya",
                'choice_a_trait' => null,
                'statement_b' => "Saya selalu menyenangkan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 68
            [
                'statement_a' => "Saya menjunjung tinggi nama baik saya",
                'choice_a_trait' => null,
                'statement_b' => "Saya terus menekuni suatu masalah sampai tuntas",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 69
            [
                'statement_a' => "Saya suka menyenangkan orang-orang yang saya kagumi",
                'choice_a_trait' => null,
                'statement_b' => "Saya ingin sukses",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 70
            [
                'statement_a' => "Saya suka orang lain mengambil Keputusan untuk kelompok",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka mengambil Keputusan untuk kelompok",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 71
            [
                'statement_a' => "Saya selalu berusaha keras",
                'choice_a_trait' => null,
                'statement_b' => "Saya mengambil Keputusan secara cepat dan mudah",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 72
            [
                'statement_a' => "Kelompok biasanya melakukan apa yang saya inginkan",
                'choice_a_trait' => null,
                'statement_b' => "Saya biasanya bekerja cepat-cepat",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 73
            [
                'statement_a' => "Saya sering merasa lelah",
                'choice_a_trait' => null,
                'statement_b' => "Saya lambat dalam mengabil Keputusan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 74
            [
                'statement_a' => "Saya bekerja cepat",
                'choice_a_trait' => null,
                'statement_b' => "Saya mudah berteman",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 75
            [
                'statement_a' => "Saya biasanya mempunyai gairah dan tenaga",
                'choice_a_trait' => null,
                'statement_b' => "Saya banyak menghabiskan waktu untuk berfikir",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 76
            [
                'statement_a' => "Saya sangat ramah terhadap orang",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka pekerjaan yang memerlukan ketelitian",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 77
            [
                'statement_a' => "Saya banyak berfikir dan membuat perencanaan",
                'choice_a_trait' => null,
                'statement_b' => "Saya menyimpan sesuatu pada tempatnya",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 78
            [
                'statement_a' => "Saya suka pekerjaan yang menuntut perhatian terhadap hal detail.",
                'choice_a_trait' => null,
                'statement_b' => "Saya tidak mudah marah",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 79
            [
                'statement_a' => "Saya suka menuruti orang yang saya kagumi",
                'choice_a_trait' => null,
                'statement_b' => "Saya selalu menyelesaikan pekerjaan yang saya telah saya mulai",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 80
            [
                'statement_a' => "Saya suka petunjuk – petunjuk yang jelas",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka bekerja keras.",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 81
            [
                'statement_a' => "Saya mngejar apa yang saya inginkan",
                'choice_a_trait' => null,
                'statement_b' => "Saya seorang pemimpin yang baik",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 82
            [
                'statement_a' => "Saya dapat membuat orang lain bekerja keras",
                'choice_a_trait' => null,
                'statement_b' => "Saya adalah type orang yang tak kenal susah",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 83
            [
                'statement_a' => "Saya mengambil Keputusan dengan cepat",
                'choice_a_trait' => null,
                'statement_b' => "Saya bicara dengan cepat",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 84
            [
                'statement_a' => "Rasanya saya bekerja secara tergesa-gesa",
                'choice_a_trait' => null,
                'statement_b' => "Saya berolah raga secara teratur",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 85
            [
                'statement_a' => "saya tidak suka bertemu kebanyakan orang",
                'choice_a_trait' => null,
                'statement_b' => "Saya cepat merasa lelah",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 86
            [
                'statement_a' => "Saya mempunyai banyak sekali teman",
                'choice_a_trait' => null,
                'statement_b' => "Saya banyak menghabiskan waktu untuk berfikir",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 87
            [
                'statement_a' => "Saya suka bekerja dengan teori",
                'choice_a_trait' => null,
                'statement_b' => "Saya suka menangani detail suatu pekerjaan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 88
            [
                'statement_a' => "Saya suka menangani detail suatu pekerjaan",
                'choice_a_trait' => null,
                'statement_b' => "Saya Suka mengorganisir pekerjaan saya",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 89
            [
                'statement_a' => "Saya menaruh barang pada tempatnya",
                'choice_a_trait' => null,
                'statement_b' => "Saya selalu menyenangkan",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Soal 90
            [
                'statement_a' => "Saya suka diberitahu apa yang perlu saya kerjakan",
                'choice_a_trait' => null,
                'statement_b' => "Saya harus menyelesaikan pekerjaan yang telah saya mulai",
                'choice_b_trait' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Gunakan DB::table untuk insert data
        DB::table('papi_questions')->insert($questionsData);

        // Mengaktifkan kembali foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}
