<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\PennyLaneService;

class SyncPennyLaneData
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Cache::has('pennylane_last_sync')) {
            app(PennyLaneService::class)->syncInvoices();
            Cache::put('pennylane_last_sync', now(), now()->addMinutes(5));
        }

        return $next($request);
    }
}
