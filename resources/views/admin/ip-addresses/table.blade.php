<div class="table-responsive">
    <table class="table table-hover mb-0">
        <thead>
            <tr>
                <th>#</th>
                <th>IP Address</th>
                <th>Name</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($ipAddresses as $index => $ip)
            <tr>
                <td>{{ $ipAddresses->firstItem() + $index }}</td>
                <td><code>{{ $ip->ip_address }}</code></td>
                <td>{{ $ip->name ?? '-' }}</td>
                <td>
                    <span class="badge bg-{{ $ip->is_active ? 'success' : 'danger' }}">
                        {{ $ip->is_active ? 'Active' : 'Inactive' }}
                    </span>
                </td>
                <td>{{ $ip->created_at->format('M d, Y') }}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-warning edit-ip-btn" 
                                data-id="{{ $ip->id }}"
                                data-ip="{{ $ip->ip_address }}"
                                data-name="{{ $ip->name }}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-info toggle-ip-btn" data-id="{{ $ip->id }}">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn btn-danger delete-ip-btn" 
                                data-id="{{ $ip->id }}"
                                data-ip="{{ $ip->ip_address }}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="fas fa-network-wired fa-3x d-block mb-3"></i>
                    <h5>No IP addresses found</h5>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>
<div class="p-3 border-top">
    {{ $ipAddresses->links() }}
</div>