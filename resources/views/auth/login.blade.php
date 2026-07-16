<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login - Atlaw Communication</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .login-container {
            width: 100%;
            max-width: 440px;
            animation: fadeInUp 0.6s ease;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .login-card {
            background: #ffffff;
            border-radius: 20px;
            padding: 48px 40px 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
        }

        .login-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        /* Logo Section */
        .logo-section {
            text-align: center;
            margin-bottom: 36px;
        }

        .logo-icon {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .logo-icon i {
            font-size: 32px;
            color: #fff;
        }

        .logo-text {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a2e;
            letter-spacing: -0.5px;
        }

        .logo-text span {
            color: #667eea;
        }

        .logo-subtitle {
            color: #6c757d;
            font-size: 14px;
            font-weight: 400;
            margin-top: 4px;
        }

        /* Welcome Text */
        .welcome-text {
            text-align: center;
            margin-bottom: 32px;
        }

        .welcome-text h4 {
            font-weight: 600;
            color: #1a1a2e;
            margin-bottom: 6px;
            font-size: 20px;
        }

        .welcome-text p {
            color: #6c757d;
            font-size: 14px;
            margin: 0;
        }

        /* Form Styles */
        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            font-weight: 500;
            font-size: 14px;
            color: #2d3436;
            margin-bottom: 6px;
            display: block;
        }

        .input-group-custom {
            position: relative;
        }

        .input-group-custom .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #adb5bd;
            font-size: 16px;
            transition: color 0.3s;
            z-index: 4;
        }

        .input-group-custom .form-control {
            padding: 12px 44px 12px 44px;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            font-size: 14px;
            font-weight: 400;
            transition: all 0.3s;
            height: 50px;
            background: #f8f9fa;
        }

        .input-group-custom .form-control:focus {
            border-color: #667eea;
            background: #ffffff;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .input-group-custom .form-control.is-invalid {
            border-color: #dc3545;
            background: #fff5f5;
        }

        .input-group-custom .toggle-password {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #adb5bd;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            z-index: 4;
            transition: color 0.3s;
        }

        .input-group-custom .toggle-password:hover {
            color: #667eea;
        }

        .input-group-custom .form-control:focus+.input-icon {
            color: #667eea;
        }

        /* Error Messages */
        .error-message {
            color: #dc3545;
            font-size: 12px;
            margin-top: 6px;
            display: block;
        }

        /* Remember Me & Forgot Password */
        .form-options {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 24px 0;
        }

        .form-options .form-check {
            margin: 0;
        }

        .form-options .form-check-input {
            width: 18px;
            height: 18px;
            border-radius: 4px;
            border: 2px solid #dee2e6;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 2px;
        }

        .form-options .form-check-input:checked {
            background-color: #667eea;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
        }

        .form-options .form-check-label {
            font-size: 14px;
            color: #495057;
            cursor: pointer;
        }

        .form-options .forgot-link {
            color: #667eea;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: color 0.3s;
        }

        .form-options .forgot-link:hover {
            color: #5a6fd6;
            text-decoration: underline;
        }

        /* Login Button */
        .btn-login {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
            height: 50px;
        }

        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .btn-login:active {
            transform: translateY(0);
        }

        .btn-login:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .btn-login .spinner {
            display: none;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            margin: 0 auto;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Session Status */
        .session-status {
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 20px;
            display: none;
        }

        .session-status.success {
            display: block;
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .session-status.error {
            display: block;
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        /* Footer */
        .login-footer {
            text-align: center;
            margin-top: 24px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
        }

        .login-footer a {
            color: #fff;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .login-footer a:hover {
            color: #fff;
            text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 576px) {
            .login-card {
                padding: 32px 24px 28px;
            }

            .logo-text {
                font-size: 24px;
            }

            .logo-icon {
                width: 60px;
                height: 60px;
            }

            .logo-icon i {
                font-size: 26px;
            }

            .form-options {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }

            .form-options .forgot-link {
                align-self: flex-start;
            }
        }
    </style>
</head>

<body>

    <div class="login-container">
        <div class="login-card">
            {{-- Logo Section --}}
            <div class="logo-section">
                <div class="logo-icon">
                    <i class="fas fa-comment-dots"></i>
                </div>
                <div class="logo-text">
                    Atlaw <span>Communication</span>
                </div>
                <div class="logo-subtitle">Admin Panel</div>
            </div>

            {{-- Welcome Text --}}
            <div class="welcome-text">
                <h4>Welcome Back!</h4>
                <p>Sign in to access your dashboard</p>
            </div>

            {{-- Session Status --}}
            @if (session('status'))
                <div class="session-status success">
                    <i class="fas fa-check-circle me-2"></i>
                    {{ session('status') }}
                </div>
            @endif

            @if ($errors->any())
                <div class="session-status error">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    {{ $errors->first() }}
                </div>
            @endif

            {{-- Login Form --}}
            <form method="POST" action="{{ route('login') }}" id="loginForm">
                @csrf

                {{-- Email --}}
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <div class="input-group-custom">
                        <span class="input-icon">
                            <i class="fas fa-envelope"></i>
                        </span>
                        <input id="email" type="email" name="email"
                            class="form-control @error('email') is-invalid @enderror" value="{{ old('email') }}"
                            placeholder="Enter your email" required autofocus autocomplete="username">
                    </div>
                    @error('email')
                        <span class="error-message">{{ $message }}</span>
                    @enderror
                </div>

                {{-- Password --}}
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-group-custom">
                        <span class="input-icon">
                            <i class="fas fa-lock"></i>
                        </span>
                        <input id="password" type="password" name="password"
                            class="form-control @error('password') is-invalid @enderror"
                            placeholder="Enter your password" required autocomplete="current-password">
                        <button type="button" class="toggle-password" id="togglePassword">
                            <i class="fas fa-eye-slash"></i>
                        </button>
                    </div>
                    @error('password')
                        <span class="error-message">{{ $message }}</span>
                    @enderror
                </div>

                {{-- Options --}}
                <div class="form-options">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="remember" id="remember_me">
                        <label class="form-check-label" for="remember_me">
                            Remember me
                        </label>
                    </div>

                </div>

                {{-- Submit Button --}}
                <button type="submit" class="btn-login" id="loginBtn">
                    <span id="btnText">Sign In</span>
                    <span class="spinner" id="btnSpinner"></span>
                </button>
            </form>
        </div>

        {{-- Footer --}}
        <div class="login-footer">
            &copy; {{ date('Y') }} <a href="#">{{ config('app.name', 'Atlaw Communication') }}</a>. All rights
            reserved.
        </div>
    </div>

    <script>
        // ============================================
        // TOGGLE PASSWORD VISIBILITY
        // ============================================
        document.getElementById('togglePassword').addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });

        // ============================================
        // LOGIN FORM SUBMISSION (FIXED)
        // ============================================
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            const loginBtn = document.getElementById('loginBtn');
            const btnText = document.getElementById('btnText');
            const spinner = document.getElementById('btnSpinner');
            let isSubmitting = false; // Prevent double submission

            // Handle form submission
            loginForm.addEventListener('submit', function(e) {
                // Prevent default submission
                e.preventDefault();

                // Prevent double submission
                if (isSubmitting) {
                    return;
                }

                // Show loading state
                isSubmitting = true;
                loginBtn.disabled = true;
                btnText.style.display = 'none';
                spinner.style.display = 'block';

                // Submit the form normally after a small delay
                setTimeout(() => {
                    // Re-enable the button after submission
                    // The form will redirect, but if there's an error, we need to reset
                    this.submit();
                }, 300);
            });

            // Reset button state if there are validation errors
            // This handles the case where the form returns with errors
            @if ($errors->any())
                loginBtn.disabled = false;
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                isSubmitting = false;
            @endif

            // ============================================
            // ENTER KEY SUPPORT (IMPROVED)
            // ============================================
            // Remove the global keydown listener and use native form behavior
            // The form will naturally submit on Enter key press
            // Just ensure all inputs are inside the form

            // ============================================
            // AUTO-HIDE SESSION MESSAGES
            // ============================================
            const statusMessages = document.querySelectorAll('.session-status');
            statusMessages.forEach(msg => {
                setTimeout(() => {
                    msg.style.opacity = '0';
                    msg.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => {
                        msg.style.display = 'none';
                    }, 500);
                }, 5000);
            });

            // ============================================
            // PREVENT ACCIDENTAL DOUBLE CLICKS
            // ============================================
            loginBtn.addEventListener('click', function(e) {
                // If the button is already disabled, prevent the click
                if (this.disabled) {
                    e.preventDefault();
                    return false;
                }
            });
        });
    </script>

</body>

</html>
