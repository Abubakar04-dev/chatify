<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin Panel') - Atlaw Communication</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            padding-top: 60px;
        }

        /* ==================== TOP NAVBAR ==================== */
        .top-navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: #1a1a2e;
            z-index: 1050;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .top-navbar .brand {
            color: #fff;
            font-size: 18px;
            font-weight: 700;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .top-navbar .brand i {
            color: #fdcb6e;
        }

        .top-navbar .brand span {
            color: #0984e3;
        }

        /* ==================== USER DROPDOWN ==================== */
        .user-dropdown {
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #fff;
            padding: 4px 8px;
            border-radius: 8px;
            transition: background 0.3s;
        }

        .user-dropdown:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        .user-dropdown .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-dropdown .user-info img {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #0984e3;
            transition: border-color 0.3s;
        }

        .user-dropdown:hover .user-info img {
            border-color: #fdcb6e;
        }

        .user-dropdown .user-info .name {
            font-weight: 500;
            font-size: 14px;
            line-height: 1.2;
        }

        .user-dropdown .user-info .role {
            font-size: 11px;
            color: #b2bec3;
        }

        .user-dropdown .dropdown-arrow {
            font-size: 12px;
            color: #b2bec3;
            transition: transform 0.3s;
            margin-left: 4px;
        }

        .user-dropdown:hover .dropdown-arrow {
            transform: rotate(180deg);
        }

        /* Dropdown Menu */
        .dropdown-menu-custom {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 220px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            padding: 8px 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.25s ease;
            z-index: 1060;
            border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .dropdown-menu-custom.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .dropdown-menu-custom .dropdown-header {
            padding: 10px 16px 8px;
            border-bottom: 1px solid #f1f2f6;
            margin-bottom: 4px;
        }

        .dropdown-menu-custom .dropdown-header .header-name {
            font-weight: 600;
            color: #1a1a2e;
            font-size: 14px;
        }

        .dropdown-menu-custom .dropdown-header .header-email {
            font-size: 12px;
            color: #b2bec3;
            margin: 0;
        }

        .dropdown-menu-custom .dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            color: #2d3436;
            text-decoration: none;
            font-size: 14px;
            transition: all 0.2s;
            border: none;
            background: none;
            width: 100%;
            text-align: left;
        }

        .dropdown-menu-custom .dropdown-item:hover {
            background: #f8f9fa;
            color: #0984e3;
        }

        .dropdown-menu-custom .dropdown-item i {
            width: 18px;
            font-size: 15px;
            color: #6c757d;
            transition: color 0.2s;
        }

        .dropdown-menu-custom .dropdown-item:hover i {
            color: #0984e3;
        }

        .dropdown-menu-custom .dropdown-divider {
            height: 1px;
            background: #f1f2f6;
            margin: 4px 12px;
        }

        .dropdown-menu-custom .dropdown-item.text-danger:hover {
            color: #dc3545;
        }

        .dropdown-menu-custom .dropdown-item.text-danger:hover i {
            color: #dc3545;
        }

        /* ==================== NAVBAR LINKS ==================== */
        .nav-links {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .nav-links a {
            color: #b2bec3;
            text-decoration: none;
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.3s;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .nav-links a:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
        }

        .nav-links a.active {
            color: #0984e3;
            background: rgba(9, 132, 227, 0.15);
        }

        .nav-links a i {
            font-size: 16px;
        }

        /* ==================== MAIN CONTENT ==================== */
        .main-content {
            padding: 30px 0;
            min-height: calc(100vh - 60px);
        }

        .main-content .container {
            max-width: 1200px;
            padding-left: 20px;
            padding-right: 20px;
        }

        /* ==================== PAGE HEADER ==================== */
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 30px;
            padding: 0 5px;
        }

        .page-header h2 {
            font-weight: 600;
            font-size: 24px;
            margin: 0;
            color: #1a1a2e;
        }

        /* ==================== STAT CARDS ==================== */
        .stat-card {
            background: #fff;
            padding: 20px 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            border: 1px solid #e9ecef;
            transition: all 0.3s;
            height: 100%;
        }

        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
        }

        .stat-number {
            font-size: 26px;
            font-weight: 700;
            color: #1a1a2e;
            line-height: 1.2;
        }

        .stat-label {
            font-size: 13px;
            color: #b2bec3;
            margin: 0;
            font-weight: 500;
        }

        .bg-primary-soft {
            background: #dfe6e9;
            color: #0984e3;
        }

        .bg-success-soft {
            background: #d4edda;
            color: #00b894;
        }

        .bg-info-soft {
            background: #d1ecf1;
            color: #0984e3;
        }

        .bg-warning-soft {
            background: #fff3cd;
            color: #fdcb6e;
        }

        /* ==================== CARDS ==================== */
        .card {
            border: none;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            background: #fff;
            overflow: hidden;
        }

        .card .card-body {
            padding: 25px;
        }

        .card .card-body.p-0 {
            padding: 0;
        }

        /* ==================== TABLE ==================== */
        .table th {
            font-weight: 600;
            color: #636e72;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #f1f2f6;
            padding: 15px 15px;
        }

        .table td {
            vertical-align: middle;
            font-size: 14px;
            padding: 12px 15px;
        }

        .table .user-avatar {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            object-fit: cover;
        }

        .badge-role {
            font-size: 11px;
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: 500;
        }

        .badge-status {
            font-size: 11px;
            padding: 5px 12px;
            border-radius: 20px;
            min-width: 75px;
            text-align: center;
            display: inline-block;
            font-weight: 500;
        }

        /* ==================== FILTERS ==================== */
        .filters-card .card-body {
            padding: 20px 25px;
        }

        .filters-card .input-group-text {
            background: #f8f9fa;
            border-color: #dee2e6;
        }

        .filters-card .form-control,
        .filters-card .form-select {
            border-color: #dee2e6;
        }

        .filters-card .form-control:focus,
        .filters-card .form-select:focus {
            border-color: #0984e3;
            box-shadow: 0 0 0 0.2rem rgba(9, 132, 227, 0.15);
        }

        /* ==================== FORMS ==================== */
        .form-label {
            font-weight: 600;
            color: #2d3436;
            font-size: 14px;
            margin-bottom: 6px;
        }

        .form-control,
        .form-select {
            border-radius: 8px;
            border: 1px solid #dee2e6;
            padding: 10px 14px;
            font-size: 14px;
        }

        .form-control:focus,
        .form-select:focus {
            border-color: #0984e3;
            box-shadow: 0 0 0 0.2rem rgba(9, 132, 227, 0.15);
        }

        .btn {
            border-radius: 8px;
            padding: 8px 20px;
            font-weight: 500;
            font-size: 14px;
        }

        .btn-sm {
            padding: 6px 14px;
            font-size: 13px;
        }

        /* ==================== TOAST ==================== */
        .custom-toast {
            position: fixed;
            top: 75px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 10px;
            color: #fff;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }

            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        /* ==================== RESPONSIVE ==================== */
        @media (max-width: 991px) {
            .nav-links a span {
                display: none;
            }

            .main-content {
                padding: 20px 0;
            }

            .main-content .container {
                padding-left: 15px;
                padding-right: 15px;
            }

            .page-header h2 {
                font-size: 20px;
            }

            .stat-number {
                font-size: 20px;
            }

            .stat-card {
                padding: 15px 20px;
            }

            .user-dropdown .user-info .name {
                display: none;
            }

            .user-dropdown .user-info .role {
                display: none;
            }

            .user-dropdown .dropdown-arrow {
                display: none;
            }
        }

        @media (max-width: 768px) {
            .top-navbar .brand {
                font-size: 14px;
            }

            .top-navbar .user-info img {
                width: 28px;
                height: 28px;
            }

            .main-content {
                padding: 15px 0;
            }

            .main-content .container {
                padding-left: 10px;
                padding-right: 10px;
            }

            .page-header h2 {
                font-size: 18px;
            }

            .stat-number {
                font-size: 18px;
            }

            .stat-card {
                padding: 12px 15px;
            }

            .table {
                font-size: 12px;
            }

            .table td,
            .table th {
                padding: 8px 10px;
            }

            .btn-group-sm .btn {
                padding: 4px 8px;
                font-size: 11px;
            }

            .nav-links a {
                padding: 6px 10px;
            }

            .nav-links a i {
                font-size: 18px;
            }

            .card .card-body {
                padding: 15px;
            }

            .filters-card .card-body {
                padding: 15px;
            }
        }

        @media (max-width: 576px) {
            .nav-links a span {
                display: none;
            }

            .nav-links {
                gap: 8px;
            }

            .page-header h2 {
                font-size: 16px;
            }

            .stat-number {
                font-size: 16px;
            }

            .stat-icon {
                width: 40px;
                height: 40px;
                font-size: 16px;
            }

            .top-navbar {
                padding: 0 12px;
            }
        }
    </style>

    @stack('styles')
</head>

<body>

    {{-- TOP NAVBAR --}}
    <nav class="top-navbar">
        <div style="display:flex;align-items:center;gap:15px;">
            <a href="{{ route('admin.users.index') }}" class="brand">
                <i class="fas fa-comment-dots"></i>
                Atlaw <span>Communication</span>
            </a>
        </div>

        <div class="nav-links">
            @if(auth()->user()->role === 'super_admin' || auth()->user()->role === 'admin')
            <a href="{{ route('admin.users.index') }}" class="{{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
                <i class="fas fa-users"></i>
                <span>Users</span>
            </a>
            @endif
            <a href="{{ url('/chatify') }}" target="_blank">
                <i class="fas fa-comment-dots"></i>
                <span>Chat</span>
            </a>
        </div>

        {{-- User Dropdown --}}
        <div class="user-dropdown" id="userDropdown">
            <div class="user-info">
                <img src="{{ auth()->user()->avatar ? asset('storage/users-avatar/' . auth()->user()->avatar) : asset('images/avatar.png') }}" alt="Avatar">
                <div>
                    <div class="name">{{ auth()->user()->name }}</div>
                    <div class="role">{{ ucfirst(auth()->user()->role) }}</div>
                </div>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>

            {{-- Dropdown Menu --}}
            <div class="dropdown-menu-custom" id="dropdownMenu">
                <div class="dropdown-header">
                    <div class="header-name">{{ auth()->user()->name }}</div>
                    <p class="header-email">{{ auth()->user()->email }}</p>
                </div>

                <a href="{{ route('profile.edit') }}" class="dropdown-item">
                    <i class="fas fa-cog"></i>
                    <span>Account Settings</span>
                </a>

                <div class="dropdown-divider"></div>

                <button class="dropdown-item text-danger" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
                <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display:none;">
                    @csrf
                </form>
            </div>
        </div>
    </nav>

    {{-- MAIN CONTENT WITH CONTAINER --}}
    <div class="main-content">
        <div class="container">
            @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show mb-4">
                <i class="fas fa-check-circle me-2"></i>
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            @endif
            @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show mb-4">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            @endif

            @yield('content')
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        $(document).ready(function() {
            // ============================================
            // USER DROPDOWN TOGGLE
            // ============================================
            const userDropdown = document.getElementById('userDropdown');
            const dropdownMenu = document.getElementById('dropdownMenu');
            let timeoutId = null;

            // Show dropdown on hover
            userDropdown.addEventListener('mouseenter', function() {
                clearTimeout(timeoutId);
                dropdownMenu.classList.add('show');
            });

            // Hide dropdown with delay
            userDropdown.addEventListener('mouseleave', function() {
                timeoutId = setTimeout(function() {
                    dropdownMenu.classList.remove('show');
                }, 200);
            });

            // Keep dropdown open when hovering over it
            dropdownMenu.addEventListener('mouseenter', function() {
                clearTimeout(timeoutId);
                dropdownMenu.classList.add('show');
            });

            dropdownMenu.addEventListener('mouseleave', function() {
                timeoutId = setTimeout(function() {
                    dropdownMenu.classList.remove('show');
                }, 200);
            });

            // ============================================
            // LOGOUT WITH CONFIRMATION
            // ============================================
            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();

                Swal.fire({
                    title: 'Are you sure?',
                    text: "You will be logged out of your account.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Yes, Logout',
                    cancelButtonText: 'Cancel',
                    reverseButtons: true,
                    customClass: {
                        popup: 'rounded-4',
                        confirmButton: 'btn btn-danger px-4',
                        cancelButton: 'btn btn-secondary px-4',
                    },
                    buttonsStyling: false,
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Show loading state
                        Swal.fire({
                            title: 'Logging out...',
                            text: 'Please wait a moment.',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        // Submit logout form
                        document.getElementById('logout-form').submit();
                    }
                });
            });

            // ============================================
            // TOAST AUTO-DISMISS
            // ============================================
            setTimeout(function() {
                $('.alert').fadeOut(300, function() {
                    $(this).remove();
                });
            }, 5000);
        });
    </script>
    @stack('scripts')

</body>

</html>