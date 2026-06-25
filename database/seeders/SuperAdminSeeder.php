<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Check if super admin already exists
        if (!User::where('role', 'super_admin')->exists()) {
            User::create([
                'name' => 'Super Admin',
                'email' => 'superadmin@atlc.com',
                'password' => Hash::make('11111111'),
                'role' => 'super_admin',
                'status' => 'active',
                'avatar' => 'avatar.png',
                'messenger_color' => '#2180f3',
            ]);

            $this->command->info('✅ Super Admin created successfully!');
            $this->command->info('📧 Email: superadmin@atlc.com');
            $this->command->info('🔑 Password: 11111111');
        } else {
            $this->command->info('ℹ️ Super Admin already exists.');
        }
    }
}
