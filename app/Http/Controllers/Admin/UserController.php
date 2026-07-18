<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get roles based on user's permission
     */
    private function getAvailableRoles()
    {
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            return ['admin', 'manager', 'it', 'agent'];
        }

        if ($user->isAdmin()) {
            return ['admin', 'manager', 'it', 'agent'];
        }

        if ($user->isManager() || $user->isIt()) {
            return ['agent'];
        }

        return ['agent'];
    }

    /**
     * Get managers list for dropdown (only for creating agents)
     */
    private function getAvailableManagers()
    {
        $user = auth()->user();

        if ($user->isSuperAdmin() || $user->isAdmin()) {
            return User::whereIn('role', ['manager', 'it'])->where('status', 'active')->get();
        }

        if ($user->isManager() || $user->isIt()) {
            return User::where('id', $user->id)->get();
        }

        return collect();
    }

    public function index(Request $request)
    {
        if (! auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        $authUser = auth()->user();

        $query = User::visibleToUser($authUser);

        // 🔥 Filter by role
        if ($request->has('role') && $request->role) {
            $availableRoles = $this->getAvailableRoles();
            if (in_array($request->role, $availableRoles)) {
                $query->where('role', $request->role);
            }
        }

        // 🔥 Filter by manager (NEW)
        if ($request->has('manager_id') && $request->manager_id) {
          
            $query->where('manager_id', $request->manager_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);

        // 🔥 Get managers list for filter (NEW)
        $managers = User::whereIn('role', ['manager'])->where('status', 'active')->get();

        // Stats based on visible users
        $stats = [
            'total' => User::visibleToUser($authUser)->count(),
            'active' => User::visibleToUser($authUser)->where('status', 'active')->count(),
            'admins' => User::visibleToUser($authUser)->whereIn('role', ['super_admin', 'admin'])->count(),
            'users' => User::visibleToUser($authUser)->where('role', 'agent')->count(),
        ];

        if ($request->ajax()) {
            $html = view('admin.users.index', compact('users', 'stats', 'managers'))->render();
            $dom = new \DOMDocument;
            @$dom->loadHTML($html);

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

            if (empty($tableContainer)) {
                $tableContainer = $html;
            }

            return response()->json([
                'html' => $tableContainer,
                'pagination' => $users->links()->render(),
                'stats' => $stats,
            ]);
        }

        return view('admin.users.index', compact('users', 'stats', 'managers'));
    }

    public function create()
    {
        if (! auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        $availableRoles = $this->getAvailableRoles();
        $managers = $this->getAvailableManagers();

        return view('admin.users.create', compact('availableRoles', 'managers'));
    }

    public function store(Request $request)
    {

        if (! auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        $availableRoles = $this->getAvailableRoles();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in($availableRoles)],
            'manager_id' => 'nullable|exists:users,id',
        ]);

        // 🔥 Validate manager assignment
        if ($request->role === 'agent' && $request->manager_id) {
            $manager = User::find($request->manager_id);
            if (! $manager || ! in_array($manager->role, ['manager', 'it'])) {
                return back()->with('error', 'Invalid manager selected.');
            }

            // Check if user can assign to this manager
            $user = auth()->user();
            if (! $user->isSuperAdmin() && ! $user->isAdmin()) {
                if ($manager->id !== $user->id) {
                    return back()->with('error', 'You can only assign agents to yourself.');
                }
            }
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'manager_id' => $request->role === 'agent' ? $request->manager_id : null,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully!');
    }

    public function edit(User $user)
    {
        if (! auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        if (! auth()->user()->isSuperAdmin() && $user->isSuperAdmin()) {
            abort(403, 'Unauthorized');
        }

        if (! in_array($user->role, $this->getAvailableRoles())) {
            abort(403, 'Unauthorized');
        }

        $availableRoles = $this->getAvailableRoles();
        $managers = $this->getAvailableManagers();

        return view('admin.users.edit', compact('user', 'availableRoles', 'managers'));
    }

    public function update(Request $request, User $user)
    {
        if (! auth()->user()->canManageUsers()) {
            abort(403, 'Unauthorized');
        }

        if (! auth()->user()->isSuperAdmin() && $user->isSuperAdmin()) {
            abort(403, 'Unauthorized');
        }

        if (! in_array($user->role, $this->getAvailableRoles())) {
            abort(403, 'Unauthorized');
        }

        $availableRoles = $this->getAvailableRoles();

        // 🔥 Only validate email uniqueness if it's being changed
        $emailRules = ['required', 'string', 'email', 'max:255'];
        if ($request->email !== $user->email) {
            $emailRules[] = Rule::unique('users')->ignore($user->id);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => $emailRules,
            'role' => ['required', Rule::in($availableRoles)],
            'password' => 'nullable|string|min:8|confirmed',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        // Validate manager assignment for Agent role
        if ($request->role === 'agent' && $request->manager_id) {
            $manager = User::find($request->manager_id);
            if (! $manager || ! in_array($manager->role, ['manager', 'it'])) {
                return back()->with('error', 'Invalid manager selected.');
            }

            $authUser = auth()->user();
            if (! $authUser->isSuperAdmin() && ! $authUser->isAdmin()) {
                if ($manager->id !== $authUser->id) {
                    return back()->with('error', 'You can only assign agents to yourself.');
                }
            }
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'manager_id' => $request->role === 'agent' ? $request->manager_id : null,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully!');
    }

    public function destroy(Request $request, User $user)
    {
        if (! auth()->user()->isSuperAdmin()) {
            return response()->json(['error' => 'Only Super Admin can delete users.'], 403);
        }

        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'You cannot delete yourself.'], 403);
        }

        $user->delete();

        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'admins' => User::whereIn('role', ['super_admin', 'admin'])->count(),
            'users' => User::where('role', 'agent')->count(),
        ];

        return response()->json([
            'success' => 'User deleted successfully!',
            'stats' => $stats,
        ]);
    }

    public function toggleStatus(Request $request, User $user)
    {
        if (! auth()->user()->canManageUsers()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (! auth()->user()->isSuperAdmin() && $user->isSuperAdmin()) {
            return response()->json(['error' => 'Cannot change Super Admin status'], 403);
        }

        if (! in_array($user->role, $this->getAvailableRoles())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $statuses = ['active', 'inactive', 'suspended'];
        $currentIndex = array_search($user->status, $statuses);
        $nextIndex = ($currentIndex + 1) % count($statuses);

        $newStatus = $statuses[$nextIndex];
        $user->update(['status' => $newStatus]);

        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'admins' => User::whereIn('role', ['super_admin', 'admin'])->count(),
            'users' => User::where('role', 'agent')->count(),
        ];

        return response()->json([
            'success' => true,
            'status' => $newStatus,
            'message' => 'Status changed to: '.ucfirst($newStatus),
            'badge_class' => $this->getStatusBadgeClass($newStatus),
            'stats' => $stats,
        ]);
    }

    private function getStatusBadgeClass($status)
    {
        return match ($status) {
            'active' => 'success',
            'inactive' => 'warning',
            'suspended' => 'danger',
            default => 'secondary',
        };
    }
}
