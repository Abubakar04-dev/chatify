@extends('layouts.admin')

@section('title', 'Edit User')

@section('content')
    <div class="page-header">
        <h2><i class="fas fa-user-edit text-primary me-2"></i>Edit User</h2>
        <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-1"></i> Back
        </a>
    </div>

    <div class="card">
        <div class="card-body">
            <form action="{{ route('admin.users.update', $user) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Full Name <span class="text-danger">*</span></label>
                        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror"
                            value="{{ old('name', $user->name) }}" required>
                        @error('name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Email <span class="text-danger">*</span></label>
                        <input type="email" name="email" class="form-control @error('email') is-invalid @enderror"
                            value="{{ old('email', $user->email) }}" required>
                        @error('email')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">New Password <small class="text-muted">(leave blank to keep
                                current)</small></label>
                        <input type="password" name="password" class="form-control @error('password') is-invalid @enderror">
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Confirm Password</label>
                        <input type="password" name="password_confirmation" class="form-control">
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Role <span class="text-danger">*</span></label>
                        <select name="role" class="form-select @error('role') is-invalid @enderror" required>
                            @foreach ($availableRoles as $role)
                                <option value="{{ $role }}"
                                    {{ old('role', $user->role) == $role ? 'selected' : '' }}>
                                    {{ ucfirst(str_replace('_', ' ', $role)) }}
                                </option>
                            @endforeach
                        </select>
                        @error('role')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <small class="text-muted">
                            @if (auth()->user()->isSuperAdmin())
                                You can change to any role.
                            @elseif(auth()->user()->isAdmin())
                                You can change to Admin, Manager, IT, and Agent.
                            @elseif(auth()->user()->isManager() || auth()->user()->isIt())
                                You can only change to Agent.
                            @endif
                        </small>
                    </div>

                    {{-- Manager selection for Agent role --}}
                    <div class="col-md-6 mb-3" id="manager-field"
                        style="{{ $user->role == 'agent' ? '' : 'display:none;' }}">
                        <label class="form-label">Assign to Manager</label>

                        @if (auth()->user()->isManager() || auth()->user()->isIt())
                           
                            <select name="manager_id" class="form-select @error('manager_id') is-invalid @enderror"
                                disabled>
                                <option value="{{ auth()->id() }}" selected>
                                    {{ auth()->user()->name }} ({{ ucfirst(auth()->user()->role) }})
                                </option>
                            </select>
                            <input type="hidden" name="manager_id" value="{{ auth()->id() }}">
                            <small class="text-muted text-primary">
                                <i class="fas fa-info-circle"></i> Agents are automatically assigned to you.
                            </small>
                        @else
                            
                            <select name="manager_id" class="form-select @error('manager_id') is-invalid @enderror">
                                <option value="">Select Manager/IT</option>
                                @foreach ($managers as $manager)
                                    <option value="{{ $manager->id }}"
                                        {{ old('manager_id', $user->manager_id) == $manager->id ? 'selected' : '' }}>
                                        {{ $manager->name }} ({{ ucfirst($manager->role) }})
                                    </option>
                                @endforeach
                            </select>
                            <small class="text-muted">Select the manager this agent reports to.</small>
                        @endif

                        @error('manager_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <div class="mt-2">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Update User
                    </button>
                    <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">Cancel</a>
                </div>
            </form>
        </div>
    </div>
@endsection


@push('scripts')
    <script>
        $(document).ready(function() {
            // Show/hide manager field based on role selection
            $('select[name="role"]').on('change', function() {
                if ($(this).val() === 'agent') {
                    $('#manager-field').show();
                    $('select[name="manager_id"]').prop('required', false);
                } else {
                    $('#manager-field').hide();
                    $('select[name="manager_id"]').prop('required', false);
                }
            });
        });
    </script>
@endpush
