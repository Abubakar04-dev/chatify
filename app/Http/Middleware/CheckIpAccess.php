<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\IpAddress;

class CheckIpAccess
{
    public function handle(Request $request, Closure $next)
    {
      
        $clientIp = $request->ip();

        // Skip for localhost
        if (in_array($clientIp, ['127.0.0.1', '::1', 'localhost'])) {
            return $next($request);
        }

        // ✅ Check if user is Super Admin by role only
        $isSuperAdmin = false;
        if (auth()->check()) {
            $user = auth()->user();
            // Check by role only
            if (isset($user->role) && ($user->role === 'super_admin' )) {
                $isSuperAdmin = true;
            }
        }

        // ✅ If Super Admin, auto-add their IP if it doesn't exist
        if ($isSuperAdmin) {
            // Check if IP exists
            $ipRecord = IpAddress::where('ip_address', $clientIp)->first();
            
            if (!$ipRecord) {
                // Auto-add Super Admin's IP
                IpAddress::create([
                    'ip_address' => $clientIp,
                    'name' => auth()->user()->name ?? 'Admin',
                    'is_active' => true,
                ]);
            } elseif (!$ipRecord->is_active) {
                // If IP exists but is inactive, activate it
                $ipRecord->update(['is_active' => true]);
            }
            
            // Allow Super Admin access
            return $next($request);
        }

        // For non-admin users: Check if IP table is empty
        if (IpAddress::count() === 0) {
            return $next($request);
        }

        // Check if IP exists and is active
        $ipRecord = IpAddress::where('ip_address', $clientIp)
            ->where('is_active', true)
            ->first();

        if (!$ipRecord) {
            abort(403, 'Your IP address (' . $clientIp . ') is not authorized to access this resource.');
        }

        return $next($request);
    }
}