<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\Admin\IpAddressController;
use App\Http\Controllers\MessageReactionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});
Route::get('/dashboard', function () {
    return redirect()->route('chatify');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth','ip'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::delete('/profile-delete', [ProfileController::class, 'delete'])->name('profile.delete');

    Route::get('/groups/create', [GroupController::class, 'create']);
    Route::post('/groups/store', [GroupController::class, 'store']);
    Route::get('/groups/users', [GroupController::class, 'users']);
    Route::get('/groups/list', [GroupController::class, 'list']);
    Route::get('/groups/{group}', [GroupController::class, 'show']);
    Route::get('/groups/{group}/messages', [GroupController::class, 'messages']);
    Route::post('/groups/send-message', [GroupController::class, 'sendMessage']);
    Route::post('/groups/mark-as-read', [GroupController::class, 'markAsRead']);

    // ============================================
    // GROUP MEMBERS ROUTES - ADD THESE
    // ============================================
    Route::get('/groups/{group}/members', [GroupController::class, 'getMembers']);
    Route::post('/groups/{group}/add-member', [GroupController::class, 'addMember']);
    Route::post('/groups/{group}/remove-member', [GroupController::class, 'removeMember']);
    Route::post('/groups/{group}/make-admin', [GroupController::class, 'makeAdmin']);
    Route::post('/groups/{group}/leave', [GroupController::class, 'leaveGroup']);
    Route::post('/groups/{group}/update', [GroupController::class, 'updateGroup']);


    // Message Reactions Routes
    Route::post('/reactions/toggle-private', [MessageReactionController::class, 'togglePrivateReaction']);
    Route::post('/reactions/toggle-group', [MessageReactionController::class, 'toggleGroupReaction']);
    Route::post('/reactions/get', [MessageReactionController::class, 'getReactions']);



    Route::prefix('admin')->group(function () {
        // User Management Routes
        Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('admin.users.create');
        Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('admin.users.show');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
        Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');
    });

    // ============================================
    // IP MANAGEMENT ROUTES (Simple)
    // ============================================
    Route::prefix('admin')->group(function () {

        // List IPs
        Route::get('/ip-addresses', [IpAddressController::class, 'index'])->name('admin.ip-addresses.index');
        Route::post('/ip-addresses', [IpAddressController::class, 'store'])->name('admin.ip-addresses.store');
        Route::put('/ip-addresses/{id}', [IpAddressController::class, 'update'])->name('admin.ip-addresses.update');
        Route::delete('/ip-addresses/{id}', [IpAddressController::class, 'destroy'])->name('admin.ip-addresses.destroy');
        Route::post('/ip-addresses/{id}/toggle', [IpAddressController::class, 'toggleActive'])->name('admin.ip-addresses.toggle');
    });

    Route::get('/users/{id}', function ($id) {
    $user = App\Models\User::find($id);
    if ($user) {
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
        ]);
    }
    return response()->json(['error' => 'User not found'], 404);
});
});
require __DIR__ . '/auth.php';
