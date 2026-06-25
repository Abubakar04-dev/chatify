@extends('layouts.admin')

@section('title', 'My Profile')

@section('content')
<div class="page-header">
    <h2><i class="fas fa-user-circle text-primary me-2"></i>My Profile</h2>
</div>

<div class="row justify-content-center">
    <div class="col-lg-10 col-xl-9">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-user-edit me-2"></i>Profile Settings</h5>
            </div>
            <div class="card-body">
                <!-- {{-- Profile Image Section --}}
                <div class="text-center mb-4">
                    <div class="position-relative d-inline-block">
                        <div class="avatar-preview" style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; border: 3px solid #0984e3; margin: 0 auto;">
                            <div id="imgPreview" style="width: 100%; height: 100%; background-size: cover; background-position: center; background-image: url('{{ Auth::user()->avatar ? asset('storage/' . Auth::user()->avatar) : asset('images/avatar.png') }}')">
                            </div>
                        </div>
                        <div class="position-absolute" style="bottom: 0; right: 0;">
                            <button class="btn btn-sm btn-primary rounded-circle" data-bs-toggle="modal" data-bs-target="#changeProfileModal" style="width: 36px; height: 36px;">
                                <i class="fas fa-camera"></i>
                            </button>
                        </div>
                        @if(Auth::user()->avatar)
                            <div class="position-absolute" style="bottom: 0; left: 0;">
                                <button class="btn btn-sm btn-danger rounded-circle" onclick="confirmDelete()" style="width: 36px; height: 36px;">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <form id="delete-profile-pic-form" action="{{ route('profile.delete') }}" method="POST" style="display: none;">
                                    @csrf
                                    @method('DELETE')
                                </form>
                            </div>
                        @endif
                    </div>
                    <p class="text-muted mt-2 mb-0">{{ Auth::user()->name }}</p>
                    <small class="text-muted">{{ ucfirst(Auth::user()->role) }}</small>
                </div> -->

                <!-- <hr> -->

                {{-- User Info Form --}}
                <form class="app-form" id="nameForm" method="POST" action="{{ route('profile.update') }}">
                    @csrf
                    @method('PATCH')
                    <h5 class="mb-3 text-dark fw-600"><i class="fas fa-info-circle me-2"></i>User Information</h5>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Full Name <span class="text-danger">*</span></label>
                            <input class="form-control @error('name') is-invalid @enderror" name="name" placeholder="Enter your full name" type="text" value="{{ old('name', $user->name) }}">
                            @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Email Address</label>
                            @if (auth()->user()->role === 'super_admin')
                                <input class="form-control @error('email') is-invalid @enderror" name="email" placeholder="user@example.com" type="email" value="{{ old('email', $user->email) }}">
                                @error('email') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                <small class="text-muted">You can change your email address.</small>
                            @else
                                <input class="form-control" name="email" placeholder="user@example.com" type="email" value="{{ old('email', $user->email) }}" disabled>
                                <small class="text-muted">You can't change your email address.</small>
                            @endif
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Role</label>
                            <input class="form-control" type="text" value="{{ ucfirst($user->role) }}" disabled>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Member Since</label>
                            <input class="form-control" type="text" value="{{ $user->created_at->format('F d, Y') }}" disabled>
                        </div>
                    </div>

                    <div class="text-end mt-2">
                        <button class="btn btn-primary" type="submit">
                            <i class="fas fa-save me-1"></i> Update Profile
                        </button>
                    </div>
                </form>

                <hr class="my-4">

                {{-- Change Password Form --}}
                <h5 class="mb-3 text-dark fw-600"><i class="fas fa-key me-2"></i>Change Password</h5>
                <form class="app-form" id="changePasswordForm" action="{{ route('password.update') }}" method="POST">
                    @csrf
                    @method('PUT')
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Current Password <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" class="form-control @error('current_password', 'updatePassword') is-invalid @enderror" name="current_password" id="current_password" placeholder="Enter current password">
                                <span class="input-group-text toggle-password" data-target="current_password" style="cursor: pointer;">
                                    <i class="fas fa-eye-slash"></i>
                                </span>
                            </div>
                            @error('current_password', 'updatePassword') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">New Password <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" class="form-control @error('password', 'updatePassword') is-invalid @enderror" name="password" id="new_password" placeholder="Enter new password">
                                <span class="input-group-text toggle-password" data-target="new_password" style="cursor: pointer;">
                                    <i class="fas fa-eye-slash"></i>
                                </span>
                            </div>
                            @error('password', 'updatePassword') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Confirm Password <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <input type="password" class="form-control @error('password_confirmation', 'updatePassword') is-invalid @enderror" name="password_confirmation" id="password_confirmation" placeholder="Confirm new password">
                                <span class="input-group-text toggle-password" data-target="password_confirmation" style="cursor: pointer;">
                                    <i class="fas fa-eye-slash"></i>
                                </span>
                            </div>
                            @error('password_confirmation', 'updatePassword') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
                        </div>
                    </div>

                    <div class="text-end mt-2">
                        <button class="btn btn-primary" type="submit">
                            <i class="fas fa-key me-1"></i> Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

{{-- Change Profile Modal --}}
<div class="modal fade" id="changeProfileModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-primary">
                <h5 class="modal-title text-white"><i class="fas fa-camera me-2"></i>Change Profile Picture</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="profileForm" action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PATCH')
                    <div class="mb-3">
                        <label class="form-label">Choose Image</label>
                        <input type="file" name="profile_picture" id="profileInput" class="form-control @error('profile_picture') is-invalid @enderror" accept="image/png, image/jpeg, image/webp, image/jpg">
                        <small class="text-muted">Recommended: Square image, max 3MB (PNG, JPG, WEBP)</small>
                        @error('profile_picture') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveProfile">
                    <i class="fas fa-upload me-1"></i> Upload
                </button>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = document.getElementById(this.dataset.target);
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    // Confirm delete profile picture
    function confirmDelete() {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will delete your profile picture permanently.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('delete-profile-pic-form').submit();
            }
        });
    }

    // Show modal if there's an error with profile picture
    @if ($errors->has('profile_picture'))
        $(document).ready(function() {
            $('#changeProfileModal').modal('show');
        });
    @endif

    // Save profile picture
    $(document).ready(function() {
        $('#saveProfile').on('click', function() {
            $('#profileForm').submit();
        });
    });

    // Form validation for profile
    $(document).ready(function() {
        let isSuperAdmin = {{ auth()->user()->role === 'super admin' ? 'true' : 'false' }};

        $("#nameForm").validate({
            rules: {
                name: {
                    required: true,
                    minlength: 3,
                    maxlength: 255
                },
                email: {
                    required: isSuperAdmin,
                    email: true
                }
            },
            messages: {
                name: {
                    required: "Please enter your name",
                    minlength: "Name must be at least 3 characters",
                    maxlength: "Name cannot exceed 255 characters"
                },
                email: {
                    required: "Please enter your email",
                    email: "Please enter a valid email address"
                }
            },
            highlight: function(element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function(element) {
                $(element).removeClass("is-invalid").addClass("is-valid");
            },
            errorPlacement: function(error, element) {
                error.addClass("text-danger small");
                error.insertAfter(element);
            }
        });

        // Password change validation
        $("#changePasswordForm").validate({
            rules: {
                current_password: {
                    required: true
                },
                password: {
                    required: true,
                    minlength: 8
                },
                password_confirmation: {
                    required: true,
                    equalTo: "#new_password"
                }
            },
            messages: {
                current_password: {
                    required: "Current password is required"
                },
                password: {
                    required: "New password is required",
                    minlength: "Password must be at least 8 characters"
                },
                password_confirmation: {
                    required: "Please confirm your password",
                    equalTo: "Passwords do not match"
                }
            },
            highlight: function(element) {
                $(element).addClass("is-invalid").removeClass("is-valid");
            },
            unhighlight: function(element) {
                $(element).removeClass("is-invalid").addClass("is-valid");
            },
            errorPlacement: function(error, element) {
                error.insertAfter(element.closest('.input-group')).addClass('text-danger small');
            }
        });
    });

    // Success messages
    @if (session('status') === 'password-updated')
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Password updated successfully!',
            timer: 3000,
            showConfirmButton: false
        });
    @endif

    @if (session('success'))
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: '{{ session('success') }}',
            timer: 3000,
            showConfirmButton: false
        });
    @endif
</script>
@endpush