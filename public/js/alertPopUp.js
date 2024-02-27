function confirmDelete(Id, route, message) {
    Swal.fire({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // If user clicks "Yes, delete it!", redirect to delete URL
            window.location.href = route + Id;
        }
    });
}

function confirmBlockUnblock(userId, status) {
    var action = status === 'true' ? 'Block' : 'Unblock';

    Swal.fire({
        title: `Are you sure you want to ${action} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // If the user clicks "Yes, block/unblock it!", redirect to the block/unblock URL
            window.location.href = `/admin/block-unblock-user?id=${userId}`;
        }
    });
}


// Assuming you have a function to add a product to the cart
const addToCart = async (productId) => {
    try {
        const response = await fetch(`/home/cart/${productId}`, {
            method: "POST",
        });

        const result = await response.json();

        if (result.success) {
            // Show SweetAlert notification
            Swal.fire({
                icon: "success",
                title: "Product Added!",
                text: result.message,
            });
        } else {
            // Show SweetAlert error
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: result.message,
            });
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    confirmDelete,
}