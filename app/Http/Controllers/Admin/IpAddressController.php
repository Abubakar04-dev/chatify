<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IpAddress;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IpAddressController extends Controller
{
    public function index(Request $request)
    {
        $query = IpAddress::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('ip_address', 'LIKE', "%{$search}%")
                  ->orWhere('name', 'LIKE', "%{$search}%");
        }

        $ipAddresses = $query->latest()->paginate(15);

        if ($request->ajax()) {
            $html = view('admin.ip-addresses.table', compact('ipAddresses'))->render();
            return response()->json(['html' => $html]);
        }

        return view('admin.ip-addresses.index', compact('ipAddresses'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ip_address' => 'required|ip|unique:ip_addresses,ip_address',
            'name' => 'nullable|string|max:255',
        ]);

        IpAddress::create([
            'ip_address' => $validated['ip_address'],
            'name' => $validated['name'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->route('admin.ip-addresses.index')
            ->with('success', 'IP Address added successfully.');
    }

    public function update(Request $request, $id)
    {
        $ipAddress = IpAddress::findOrFail($id);

        $validated = $request->validate([
            'ip_address' => [
                'required',
                'ip',
                Rule::unique('ip_addresses', 'ip_address')->ignore($id),
            ],
            'name' => 'nullable|string|max:255',
        ]);

        $ipAddress->update([
            'ip_address' => $validated['ip_address'],
            'name' => $validated['name'] ?? null,
        ]);

        return redirect()->route('admin.ip-addresses.index')
            ->with('success', 'IP Address updated successfully.');
    }

    public function destroy($id)
    {
        $ipAddress = IpAddress::findOrFail($id);
        $ip = $ipAddress->ip_address;
        $ipAddress->delete();

        if (request()->ajax()) {
            return response()->json(['success' => "IP Address '{$ip}' deleted successfully."]);
        }

        return redirect()->route('admin.ip-addresses.index')
            ->with('success', "IP Address '{$ip}' deleted successfully.");
    }

    public function toggleActive($id)
    {
        $ipAddress = IpAddress::findOrFail($id);
        $ipAddress->update(['is_active' => !$ipAddress->is_active]);

        $status = $ipAddress->is_active ? 'activated' : 'deactivated';

        if (request()->ajax()) {
            return response()->json([
                'success' => true,
                'message' => "IP Address has been {$status}."
            ]);
        }

        return redirect()->back()
            ->with('success', "IP Address has been {$status}.");
    }
}