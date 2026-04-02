<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class TestController extends Controller
{
    public function index(Request $request)
    {
        // Pastikan token ada di session
        if (!$request->session()->has('token')) {
            return redirect()->route('token.input');
        }

        return Inertia::render('Psikotest/TestPage');
    }
}