<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'avatar',
        'messenger_color',
        'dark_mode',
        'active_status',
        'manager_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function reactions()
    {
        return $this->hasMany(MessageReaction::class, 'user_id');
    }

    // 🔥 Role Check Methods
    public function isSuperAdmin()
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin()
    {
        return $this->role === 'admin' || $this->role === 'super_admin';
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isManager()
    {
        return $this->role === 'manager';
    }

    public function isIt()
    {
        return $this->role === 'it';
    }

    public function isAgent()
    {
        return $this->role === 'agent';
    }

    public function canManageUsers()
    {
        return $this->role === 'super_admin' || $this->role === 'admin' || $this->role === 'manager' || $this->role === 'it';
    }

    // Scope for filtering
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAdmins($query)
    {
        return $query->whereIn('role', ['super_admin', 'admin']);
    }

    // ============================================
    // 🔥 MANAGER-AGENT RELATIONSHIPS
    // ============================================

    // Agent belongs to a Manager
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    // Manager has many Agents
    public function agents()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    // Check if user is under a specific manager
    public function isUnderManager($managerId)
    {
        return $this->manager_id === $managerId;
    }

    /**
     * Scope a query to only show users that the current user can manage based on hierarchy
     */
    public function scopeVisibleToUser($query, $user)
    {
        // 🔥 ALWAYS EXCLUDE THE LOGGED-IN USER
        $query->where('id', '!=', $user->id);

        // Super Admin can see everyone except themselves
        if ($user->isSuperAdmin()) {
            return $query;
        }

        // Admin can see Admin, Manager, IT, Agent (not Super Admin)
        if ($user->isAdmin()) {
            return $query->whereIn('role', ['manager', 'it', 'agent']);
        }

        // Manager can see only agents under them
        if ($user->isManager()) {
            return $query->where('role', 'agent')
                ->where('manager_id', $user->id);
        }

        // IT can see only agents under them
        if ($user->isIt()) {
            return $query->where('role', 'agent');
        }

        // Agent or other roles see nothing
        return $query->whereRaw('1 = 0');
    }

    // ============================================
    // 🔥 ADD THIS - GROUP RELATIONSHIPS
    // ============================================

    // 🔥 Groups the user is a member of
    public function groups()
    {
        return $this->belongsToMany(ChatGroup::class, 'chat_group_members', 'user_id', 'group_id')
            ->withPivot('is_admin')
            ->withTimestamps();
    }

    // 🔥 Group memberships
    public function groupMemberships()
    {
        return $this->hasMany(ChatGroupMember::class);
    }

    // 🔥 Messages sent by user in groups
    public function groupMessages()
    {
        return $this->hasMany(ChatGroupMessage::class, 'sender_id');
    }
}
