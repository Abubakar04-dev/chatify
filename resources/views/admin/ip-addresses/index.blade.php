@extends('layouts.admin')

@section('title', 'IP Management')

@section('content')
<div class="page-header">
    <h2><i class="fas fa-network-wired text-primary me-2"></i>IP Management</h2>
    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addIpModal">
        <i class="fas fa-plus me-1"></i> Add IP
    </button>
</div>



{{-- Search --}}
<div class="card mb-4">
    <div class="card-body">
        <div class="input-group">
            <span class="input-group-text"><i class="fas fa-search"></i></span>
            <input type="text" id="search-input" class="form-control" placeholder="Search by IP or name...">
            <button id="search-btn" class="btn btn-primary"><i class="fas fa-search"></i></button>
            <button id="reset-btn" class="btn btn-secondary"><i class="fas fa-undo"></i></button>
        </div>
    </div>
</div>

{{-- Current IP --}}
<div class="alert alert-info">
    <i class="fas fa-info-circle me-2"></i>
    Your current IP: <strong>{{ request()->ip() }}</strong>
    @if($ipAddresses->contains('ip_address', request()->ip()))
    <span class="badge bg-success ms-2">Authorized</span>
    @else
    <span class="badge bg-danger ms-2">Not Authorized</span>
    @endif
</div>

{{-- IP Table --}}
<div class="card">
    <div class="card-body p-0" id="ip-table-container">
        @include('admin.ip-addresses.table', ['ipAddresses' => $ipAddresses])
    </div>
</div>

{{-- Add IP Modal --}}
<div class="modal fade" id="addIpModal" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="{{ route('admin.ip-addresses.store') }}" method="POST" id="addIpForm">
                @csrf
                <div class="modal-header">
                    <h5 class="modal-title">Add IP Address</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">IP Address <span class="text-danger">*</span></label>
                        <input type="text" name="ip_address" id="ip_address" 
                               class="form-control @error('ip_address') is-invalid @enderror" 
                               placeholder="192.168.1.1" 
                               value="{{ old('ip_address') }}" required>
                        @error('ip_address')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Name</label>
                        <input type="text" name="name" id="ip_name" 
                               class="form-control @error('name') is-invalid @enderror" 
                               placeholder="Office Network"
                               value="{{ old('name') }}">
                        @error('name')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="submit-btn">
                        <i class="fas fa-save me-1"></i> Save
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- Edit IP Modal --}}
<div class="modal fade" id="editIpModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form id="editIpForm" method="POST">
                @csrf
                @method('PUT')
                <div class="modal-header">
                    <h5 class="modal-title">Edit IP Address</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">IP Address <span class="text-danger">*</span></label>
                        <input type="text" name="ip_address" id="edit_ip_address" 
                               class="form-control @error('ip_address') is-invalid @enderror" 
                               value="{{ old('ip_address', $ipAddress->ip_address ?? '') }}" required>
                        @error('ip_address')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Name</label>
                        <input type="text" name="name" id="edit_name" 
                               class="form-control @error('name') is-invalid @enderror" 
                               value="{{ old('name', $ipAddress->name ?? '') }}">
                        @error('name')
                            <div class="invalid-feedback d-block">{{ $message }}</div>
                        @enderror
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    // ============================================
    // ✅ Auto-open modal if there are validation errors
    // ============================================
    @if($errors->any())
        $('#addIpModal').modal('show');
    @endif

    // ============================================
    // SEARCH & FILTER
    // ============================================
    function searchIp() {
        let search = $('#search-input').val();

        $('#ip-table-container').html('<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i></div>');

        $.ajax({
            url: "{{ route('admin.ip-addresses.index') }}",
            type: 'GET',
            data: {
                search: search
            },
            success: function(response) {
                $('#ip-table-container').html(response.html);
            },
            error: function() {
                $('#ip-table-container').html('<div class="text-center py-5 text-danger">Failed to load</div>');
            }
        });
    }

    $('#search-btn').on('click', searchIp);
    $('#search-input').on('keypress', function(e) {
        if (e.which == 13) searchIp();
    });

    $('#reset-btn').on('click', function() {
        $('#search-input').val('');
        searchIp();
    });

    // ============================================
    // EDIT IP
    // ============================================
    $(document).on('click', '.edit-ip-btn', function() {
        let id = $(this).data('id');
        let ip = $(this).data('ip');
        let name = $(this).data('name');

        $('#edit_ip_address').val(ip);
        $('#edit_name').val(name);
        $('#editIpForm').attr('action', "{{ url('admin/ip-addresses') }}/" + id);
        $('#editIpModal').modal('show');
    });

    // ============================================
    // TOGGLE IP STATUS
    // ============================================
    $(document).on('click', '.toggle-ip-btn', function() {
        let id = $(this).data('id');
        let btn = $(this);
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

        $.ajax({
            url: "{{ url('admin/ip-addresses') }}/" + id + "/toggle",
            type: 'POST',
            data: {
                _token: "{{ csrf_token() }}"
            },
            success: function(response) {
                if (response.success) {
                    location.reload();
                }
            },
            error: function() {
                showToast('danger', 'Failed to toggle status');
                btn.prop('disabled', false).html('<i class="fas fa-sync-alt"></i>');
            }
        });
    });

    // ============================================
    // DELETE IP
    // ============================================
    $(document).on('click', '.delete-ip-btn', function() {
        let id = $(this).data('id');
        let ip = $(this).data('ip');

        if (!confirm('Delete IP "' + ip + '"?')) return;

        $.ajax({
            url: "{{ url('admin/ip-addresses') }}/" + id,
            type: 'DELETE',
            data: {
                _token: "{{ csrf_token() }}"
            },
            success: function(response) {
                if (response.success) {
                    showToast('success', response.success);
                    setTimeout(searchIp, 500);
                }
            },
            error: function() {
                showToast('danger', 'Failed to delete IP');
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

    // Clear error state when modal is hidden
    $('#addIpModal').on('hidden.bs.modal', function() {
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').remove();
    });
});
</script>
@endpush