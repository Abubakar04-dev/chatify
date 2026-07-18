@extends('layouts.admin')

@section('title', 'Create User')

@section('content')
    <div class="page-header">
        <h2><i class="fas fa-user-plus text-primary me-2"></i>Create User</h2>
        <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-1"></i> Back
        </a>
    </div>

    <div class="card">
        <div class="card-body">
            <form action="{{ route('admin.users.store') }}" method="POST">
                @csrf

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Full Name <span class="text-danger">*</span></label>
                        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror"
                            value="{{ old('name') }}" required>
                        @error('name')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Email <span class="text-danger">*</span></label>
                        <input type="email" name="email" class="form-control @error('email') is-invalid @enderror"
                            value="{{ old('email') }}" required>
                        @error('email')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Password <span class="text-danger">*</span></label>
                        <input type="password" name="password" class="form-control @error('password') is-invalid @enderror"
                            required>
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Confirm Password <span class="text-danger">*</span></label>
                        <input type="password" name="password_confirmation" class="form-control" required>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Role <span class="text-danger">*</span></label>
                        <select name="role" class="form-select @error('role') is-invalid @enderror" required>
                            @foreach ($availableRoles as $role)
                                <option value="{{ $role }}" {{ old('role') == $role ? 'selected' : '' }}>
                                    {{ ucfirst(str_replace('_', ' ', $role)) }}
                                </option>
                            @endforeach
                        </select>
                        @error('role')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                        <small class="text-muted">
                            @if (auth()->user()->isSuperAdmin())
                                You can create any role.
                            @elseif(auth()->user()->isAdmin())
                                You can create Admin, Manager, IT, and Agent.
                            @elseif(auth()->user()->isManager() || auth()->user()->isIt())
                                You can only create Agents .
                            @endif
                        </small>
                    </div>

                    {{-- Manager selection for Agent role --}}
                    <div class="col-md-6 mb-3" id="manager-field" style="display:none;">
                        <label class="form-label">Assign to Manager <span class="text-danger">*</span></label>

                        @if (auth()->user()->isManager() || auth()->user()->isIt())
                            {{-- 🔥 Manager/IT: Read-only, auto-assigned to themselves --}}
                            <select name="manager_id" class="form-select @error('manager_id') is-invalid @enderror"
                                disabled>
                                <option value="{{ auth()->id() }}" selected>
                                    {{ auth()->user()->name }} ({{ ucfirst(auth()->user()->role) }})
                                </option>
                            </select>
                            <input type="hidden" name="manager_id" value="{{ auth()->id() }}">
                            <small class="text-muted text-primary">
                                <i class="fas fa-info-circle"></i> Agents will be assigned to you automatically.
                            </small>
                        @else
                            {{-- 🔥 Super Admin/Admin: Can select any manager --}}
                            <select name="manager_id" class="form-select @error('manager_id') is-invalid @enderror">
                                <option value="">Select Manager/IT</option>
                                @foreach ($managers as $manager)
                                    <option value="{{ $manager->id }}"
                                        {{ old('manager_id') == $manager->id ? 'selected' : '' }}>
                                        {{ $manager->name }} ({{ ucfirst($manager->role) }})
                                    </option>
                                @endforeach
                            </select>
                            <small class="text-muted">Select the manager this agent will report to.</small>
                        @endif

                        @error('manager_id')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="mt-2">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i> Create User
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
                    $('select[name="manager_id"]').prop('required', true);
                } else {
                    $('#manager-field').hide();
                    $('select[name="manager_id"]').prop('required', false);
                }
            });

            // Trigger on page load
            if ($('select[name="role"]').val() === 'agent') {
                $('#manager-field').show();
                $('select[name="manager_id"]').prop('required', true);
            }
        });
    </script>
@endpush
