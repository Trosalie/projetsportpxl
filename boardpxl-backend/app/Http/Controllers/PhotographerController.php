<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PhotographerController extends Controller
{
    public function getPhotographers()
    {
        $photographers = DB::table('photographers')->get();
        return response()->json($photographers);
    }
}
