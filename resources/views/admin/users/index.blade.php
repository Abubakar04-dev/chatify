@extends('layouts.admin')

@section('title', 'User Management')

@section('content')
    <div class="page-header">
        <h2><i class="fas fa-users text-primary me-2"></i>User Management</h2>
        @if (auth()->user()->canManageUsers())
            <a href="{{ route('admin.users.create') }}" class="btn btn-primary">
                <i class="fas fa-user-plus me-1"></i> Add User
            </a>
        @endif
    </div>

    {{-- Stats --}}
    <div class="row g-4 mb-4" id="stats-container">
        <div class="col-6 col-md-3">
            <div class="stat-card">
                <div class="d-flex align-items-center">
                    <div class="stat-icon bg-primary-soft"><i class="fas fa-users"></i></div>
                    <div class="ms-3">
                        <div class="stat-number">{{ $stats['total'] }}</div>
                        <p class="stat-label">Total Users</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-card">
                <div class="d-flex align-items-center">
                    <div class="stat-icon bg-success-soft"><i class="fas fa-user-check"></i></div>
                    <div class="ms-3">
                        <div class="stat-number">{{ $stats['active'] }}</div>
                        <p class="stat-label">Active</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-card">
                <div class="d-flex align-items-center">
                    <div class="stat-icon bg-info-soft"><i class="fas fa-user-shield"></i></div>
                    <div class="ms-3">
                        <div class="stat-number">{{ $stats['admins'] }}</div>
                        <p class="stat-label">Admins</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="stat-card">
                <div class="d-flex align-items-center">
                    <div class="stat-icon bg-warning-soft"><i class="fas fa-user"></i></div>
                    <div class="ms-3">
                        <div class="stat-number">{{ $stats['users'] }}</div>
                        <p class="stat-label">Agents</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Filters --}}
    <div class="card filters-card mb-4">
        <div class="card-body">
            <div class="row g-3">
                <div class="col-12 col-md-3">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" id="search-input" class="form-control" placeholder="Search users..."
                            value="{{ request('search') }}">
                    </div>
                </div>

                <div class="col-6 col-md-2">
                    <select id="role-filter" class="form-select">
                        <option value="">All Roles</option>
                        @php
                            $user = auth()->user();
                            $roleOptions = [];

                            if ($user->isSuperAdmin()) {
                                $roleOptions = ['admin', 'manager', 'it', 'agent'];
                            } elseif ($user->isAdmin()) {
                                $roleOptions = ['manager', 'it', 'agent'];
                            } elseif ($user->isManager() || $user->isIt()) {
                                $roleOptions = ['agent'];
                            } else {
                                $roleOptions = [];
                            }

                            $roleLabels = [
                                'super_admin' => 'Super Admin',
                                'admin' => 'Admin',
                                'manager' => 'Manager',
                                'it' => 'IT',
                                'agent' => 'Agent',
                            ];
                        @endphp

                        @foreach ($roleOptions as $role)
                            <option value="{{ $role }}" {{ request('role') == $role ? 'selected' : '' }}>
                                {{ $roleLabels[$role] ?? ucfirst($role) }}
                            </option>
                        @endforeach
                    </select>
                </div>
                @if (auth()->user()->isSuperAdmin() || auth()->user()->isAdmin())
                    <div class="col-6 col-md-2">
                        <select id="manager-filter" class="form-select">
                            <option value="">All Managers</option>
                            @foreach ($managers as $manager)
                                <option value="{{ $manager->id }}"
                                    {{ request('manager_id') == $manager->id ? 'selected' : '' }}>
                                    {{ $manager->name }} ({{ ucfirst($manager->role) }})
                                </option>
                            @endforeach
                        </select>
                    </div>
                @endif

                <div class="col-6 col-md-2">
                    <select id="status-filter" class="form-select">
                        <option value="">All Status</option>
                        <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Active</option>
                        <option value="inactive" {{ request('status') == 'inactive' ? 'selected' : '' }}>Inactive</option>
                        <option value="suspended" {{ request('status') == 'suspended' ? 'selected' : '' }}>Suspended
                        </option>
                    </select>
                </div>

                <div class="col-6 col-md-1">
                    <button id="reset-filters" class="btn btn-secondary w-100"><i class="fas fa-undo"></i></button>
                </div>
                <div class="col-6 col-md-1">
                    <button id="apply-filters" class="btn btn-primary w-100"><i class="fas fa-filter"></i></button>
                </div>
            </div>
        </div>
    </div>

    {{-- Table --}}
    <div class="card">
        <div class="card-body p-0" id="users-table-container">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Manager</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($users as $index => $user)
                            <tr>
                                <td>{{ $users->firstItem() + $index }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="{{ $user->avatar ? asset('storage/users-avatar/' . $user->avatar) : asset('images/avatar.png') }}"
                                            class="user-avatar me-2">
                                        <div>
                                            <strong>{{ $user->name }}</strong>
                                            @if ($user->id === auth()->id())
                                                <span class="badge bg-secondary ms-1" style="font-size:9px;">You</span>
                                            @endif
                                        </div>
                                    </div>
                                </td>
                                <td>{{ $user->email }}</td>
                                <td>
                                    @php
                                        $roleColors = [
                                            'super_admin' => 'danger',
                                            'admin' => 'warning',
                                            'manager' => 'primary',
                                            'it' => 'info',
                                            'agent' => 'secondary',
                                        ];
                                        $roleLabels = [
                                            'super_admin' => 'Super Admin',
                                            'admin' => 'Admin',
                                            'manager' => 'Manager',
                                            'it' => 'IT',
                                            'agent' => 'Agent',
                                        ];
                                    @endphp
                                    <span class="badge badge-role bg-{{ $roleColors[$user->role] ?? 'secondary' }}">
                                        {{ $roleLabels[$user->role] ?? ucfirst($user->role) }}
                                    </span>
                                </td>
                                <td>
                                    {{-- 🔥 Manager Column --}}
                                    @if ($user->role == 'agent' && $user->manager)
                                        <span class="badge bg-light text-dark border">
                                            <i class="fas fa-user-tie me-1"></i> {{ $user->manager->name }}
                                        </span>
                                    @else
                                        <span class="text-muted">—</span>
                                    @endif
                                </td>
                                <td>
                                    <span
                                        class="badge badge-status status-badge bg-{{ $user->status == 'active' ? 'success' : ($user->status == 'inactive' ? 'warning' : 'danger') }}">
                                        {{ ucfirst($user->status) }}
                                    </span>
                                </td>
                                <td>{{ $user->created_at->format('M d, Y') }}</td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        @if (auth()->user()->canManageUsers())
                                            <a href="{{ route('admin.users.edit', $user) }}" class="btn btn-warning"
                                                title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <button class="btn btn-info toggle-status-btn"
                                                data-user-id="{{ $user->id }}" title="Toggle Status">
                                                <i class="fas fa-sync-alt"></i>
                                            </button>
                                        @endif
                                        {{-- @if (auth()->user()->isSuperAdmin() && $user->id !== auth()->id())
                                            <button class="btn btn-danger delete-user-btn"
                                                data-user-id="{{ $user->id }}" data-user-name="{{ $user->name }}"
                                                title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        @endif --}}
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-5 text-muted">
                                    <i class="fas fa-users-slash fa-3x d-block mb-3"></i>
                                    <h5>No users found</h5>
                                    <p class="text-muted">Try adjusting your filters or create a new user.</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="p-3 border-top">
                {{ $users->links() }}
            </div>
        </div>
    </div>
@endsection
@push('scripts')
    <script>
        $(document).ready(function() {
            // ============================================
            // FILTER USERS WITH AJAX
            // ============================================
            function filterUsers() {
                let search = $('#search-input').val();
                let role = $('#role-filter').val();
                let status = $('#status-filter').val();
                  let manager_id = $('#manager-filter').val();

                $('#users-table-container').html(
                    '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i></div>'
                );

                $.ajax({
                    url: "{{ route('admin.users.index') }}",
                    type: 'GET',
                    data: {
                        search: search,
                        role: role,
                        status: status,
                         manager_id: manager_id 
                    },
                    success: function(response) {
                        $('#users-table-container').html(response.html);
                        if (response.pagination) {
                            $('#users-table-container').append(response.pagination);
                        }
                        if (response.stats) {
                            updateStats(response.stats);
                        }
                    },
                    error: function() {
                        $('#users-table-container').html(
                            '<div class="text-center py-5 text-danger">Failed to load users</div>');
                    }
                });
            }

            function updateStats(stats) {
                $('#stats-container').html(`
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-primary-soft"><i class="fas fa-users"></i></div>
                        <div class="ms-3">
                            <div class="stat-number">${stats.total}</div>
                            <p class="stat-label">Total Users</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-soft"><i class="fas fa-user-check"></i></div>
                        <div class="ms-3">
                            <div class="stat-number">${stats.active}</div>
                            <p class="stat-label">Active</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info-soft"><i class="fas fa-user-shield"></i></div>
                        <div class="ms-3">
                            <div class="stat-number">${stats.admins}</div>
                            <p class="stat-label">Admins</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="stat-card">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning-soft"><i class="fas fa-user"></i></div>
                        <div class="ms-3">
                            <div class="stat-number">${stats.users}</div>
                            <p class="stat-label">Users</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
            }

            $('#apply-filters').on('click', filterUsers);
            $('#search-input').on('keypress', function(e) {
                if (e.which == 13) filterUsers();
            });

            $('#reset-filters').on('click', function() {
                $('#search-input').val('');
                $('#role-filter').val('');
                $('#status-filter').val('');
                filterUsers();
            });

            // ============================================
            // TOGGLE USER STATUS WITH AJAX
            // ============================================
            $(document).on('click', '.toggle-status-btn', function() {
                let userId = $(this).data('user-id');
                let btn = $(this);
                btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

                $.ajax({
                    url: "{{ url('admin/users') }}/" + userId + "/toggle-status",
                    type: 'POST',
                    data: {
                        _token: "{{ csrf_token() }}"
                    },
                    success: function(response) {
                        if (response.success) {
                            let row = btn.closest('tr');
                            let badge = row.find('.status-badge');
                            let statusText = response.status.charAt(0).toUpperCase() + response
                                .status.slice(1);
                            badge.text(statusText);
                            badge.removeClass('bg-success bg-warning bg-danger bg-secondary')
                                .addClass('bg-' + response.badge_class);

                            showToast('success', response.message);

                            if (response.stats) {
                                updateStats(response.stats);
                            }
                        }
                    },
                    error: function(xhr) {
                        let error = xhr.responseJSON?.error || 'Failed to toggle status';
                        showToast('danger', error);
                    },
                    complete: function() {
                        btn.prop('disabled', false).html('<i class="fas fa-sync-alt"></i>');
                    }
                });
            });

            // ============================================
            // DELETE USER WITH AJAX
            // ============================================
            $(document).on('click', '.delete-user-btn', function() {
                let userId = $(this).data('user-id');
                let userName = $(this).data('user-name');
                let btn = $(this);

                if (!confirm('Delete "' + userName + '"?')) return;

                btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

                $.ajax({
                    url: "{{ url('admin/users') }}/" + userId,
                    type: 'DELETE',
                    data: {
                        _token: "{{ csrf_token() }}"
                    },
                    success: function(response) {
                        if (response.success) {
                            btn.closest('tr').fadeOut(300, function() {
                                $(this).remove();
                                showToast('success', response.success);
                                setTimeout(filterUsers, 500);
                            });
                        }
                    },
                    error: function(xhr) {
                        let error = xhr.responseJSON?.error || 'Failed to delete user';
                        showToast('danger', error);
                    },
                    complete: function() {
                        btn.prop('disabled', false).html('<i class="fas fa-trash"></i>');
                    }
                });
            });

            // ============================================
            // TOAST NOTIFICATION
            // ============================================
            function showToast(type, message) {
                $('.custom-toast').remove();
                let bgColor = type === 'success' ? '#00b894' : '#ff4757';
                let icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
                let toast = $(`
            <div class="custom-toast" style="background:${bgColor};">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
                <span style="cursor:pointer;margin-left:10px;font-size:18px;" onclick="$(this).parent().remove()">×</span>
            </div>
        `);
                $('body').append(toast);
                setTimeout(function() {
                    toast.fadeOut(300, function() {
                        $(this).remove();
                    });
                }, 3000);
            }
        });
    </script>
@endpush
