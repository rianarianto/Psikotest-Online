<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Token;
use Illuminate\Support\Facades\Log;

class RecoverSessionFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Jika sesi token_id tidak ada, coba pulihkan dari cookie
        if (!session()->has('token_id') && $request->hasCookie('psikotest_token')) {
            $cookieTokenValue = $request->cookie('psikotest_token');
            
            // Cari token di database
            $recoveredToken = Token::where('token', $cookieTokenValue)->first();

            // Izinkan pemulihan sesi baik status in_progress maupun used (agar finish-test tetap bisa dibuka)
            if ($recoveredToken && !$recoveredToken->isExpired() && ($recoveredToken->status === 'in_progress' || $recoveredToken->status === 'used')) {
                session([
                    'token_id' => $recoveredToken->id,
                    'test_type' => $recoveredToken->test_type,
                    'participant_id' => $recoveredToken->used_by
                ]);
                
                Log::info('RecoverSessionFromCookie: Session recovered for token ' . $cookieTokenValue);
            }
        }

        return $next($request);
    }
}
