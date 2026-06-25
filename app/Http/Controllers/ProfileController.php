<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect;
use App\Http\Requests\ProfileUpdateRequest;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        return view('profile.edit', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            $request->validate([
                'profile_picture' => 'required|image|mimes:jpeg,png,jpg,webp|max:3000',
            ]);

            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $file = $request->file('profile_picture');
            $avatarPath = $file->store('avatars', 'public');
            $user->avatar = $avatarPath;
            $user->save();

            return redirect()->route('profile.edit')->with('success', 'Profile picture updated successfully!');
        }

        // Validate user info
        $validated_data = $request->validate([
            'name' => 'required|min:3|max:255',
            'email' => Auth::user()->role === 'super admin' ? 'required|email|unique:users,email,' . $user->id : 'nullable|email',
        ]);

        // Update user info
        $user->name = $validated_data['name'];
        if (Auth::user()->role === 'super admin') {
            $user->email = $validated_data['email'];
        }

        $user->save();

        return redirect()->route('profile.edit')->with('success', 'Profile updated successfully!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function delete()
    {

        $user = Auth::user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->avatar = null;
            $user->save();
            return redirect()->route('profile.edit')->with('success', 'Profile picture deleted successfully!');
        }

        return redirect()->route('profile.edit')->with('error', 'No profile picture found.');
    }
}
