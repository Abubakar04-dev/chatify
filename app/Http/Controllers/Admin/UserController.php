<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        $query = User::where('id', '!=', auth()->id())
            ->where('role', '!=', 'super_admin');

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);
        
        // Keep filter values in session for pagination
        $request->session()->put('admin_filters', [
            'search' => $request->search,
            'role' => $request->role,
            'status' => $request->status,
        ]);
        
        $stats = [
            'total' => User::where('role', '!=', 'super_admin')->count(),
            'active' => User::where('role', '!=', 'super_admin')->where('status', 'active')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'users' => User::where('role', 'user')->count(),
        ];

        if ($request->ajax()) {
            // Render the table HTML directly from the index view
            $html = view('admin.users.index', compact('users', 'stats'))->render();
            
            // Extract just the table container part for AJAX updates
            $dom = new \DOMDocument();
            @$dom->loadHTML($html);
            
            // Get the table container
            $tableContainer = '';
            if ($dom) {
                $xpath = new \DOMXPath($dom);
                $nodes = $xpath->query('//div[@id="users-table-container"]');
                if ($nodes->length > 0) {
                    foreach ($nodes as $node) {
                        $tableContainer .= $dom->saveHTML($node);
                    }
                }
            }
            
            // If we couldn't extract it, just return the whole view
            if (empty($tableContainer)) {
                $tableContainer = $html;
            }
            
            return response()->json([
                'html' => $tableContainer,
                'pagination' => $users->links()->render(),
                'stats' => $stats,
            ]);
        }

        return view('admin.users.index', compact('users', 'stats'));
    }

    public function create()
    {
        if (!auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }
        return view('admin.users.create');
    }

    public function store(Request $request)
    {
        if (!auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(['admin', 'user'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        if ($request->role === 'admin' && !auth()->user()->isSuperAdmin()) {
            return back()->with('error', 'Only Super Admin can create Admin users.');
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => $request->status,
            'messenger_color' => '#2180f3',
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully!');
    }

    public function edit(User $user)
    {
        if (!auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        if ($user->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
            abort(403, 'Unauthorized');
        }

        return view('admin.users.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        if (!auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        if ($user->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'user'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($request->role === 'admin' && !auth()->user()->isSuperAdmin()) {
            return back()->with('error', 'Only Super Admin can assign Admin role.');
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'status' => $request->status,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully!');
    }

    public function destroy(Request $request, User $user)
    {
        if (!auth()->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Only Super Admin can delete users.'], 403);
        }

        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'You cannot delete yourself.'], 403);
        }

        $user->delete();

        // Get updated stats
        $stats = [
            'total' => User::where('role', '!=', 'super_admin')->count(),
            'active' => User::where('role', '!=', 'super_admin')->where('status', 'active')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'users' => User::where('role', 'user')->count(),
        ];

        return response()->json([
            'success' => 'User deleted successfully!',
            'stats' => $stats
        ]);
    }

    public function toggleStatus(Request $request, User $user)
    {
        if (!auth()->user()->canManageUsers()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Cannot change Super Admin status'], 403);
        }

        $statuses = ['active', 'inactive', 'suspended'];
        $currentIndex = array_search($user->status, $statuses);
        $nextIndex = ($currentIndex + 1) % count($statuses);
        
        $newStatus = $statuses[$nextIndex];
        $user->update(['status' => $newStatus]);

        // Get updated stats
        $stats = [
            'total' => User::where('role', '!=', 'super_admin')->count(),
            'active' => User::where('role', '!=', 'super_admin')->where('status', 'active')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'users' => User::where('role', 'user')->count(),
        ];

        return response()->json([
            'success' => true,
            'status' => $newStatus,
            'message' => "Status changed to: " . ucfirst($newStatus),
            'badge_class' => $this->getStatusBadgeClass($newStatus),
            'stats' => $stats,
        ]);
    }

    private function getStatusBadgeClass($status)
    {
        return match($status) {
            'active' => 'success',
            'inactive' => 'warning',
            'suspended' => 'danger',
            default => 'secondary',
        };
    }
}