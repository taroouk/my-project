<?php
use App\Http\Controllers\AuthController;

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
