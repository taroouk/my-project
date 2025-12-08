<?php
use App\Http\Controllers\AuthController;

Route::post('/signup', [AuthController::class, 'signup'])->name('signup');

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
