let rowData = [];
let gridOptions = {
    columnDefs: [
        {
            headerName: "Actions",
            cellRenderer: function (params) {
                var actionDiv = document.createElement('div');
                actionDiv.innerHTML = '<button class="btn btn-sm btn-success">Edit</button><button class="btn btn-sm btn-danger">Delete</button>';
                var editButton = actionDiv.querySelector('.btn-success');

                editButton.addEventListener('click', function () {
                    $('#addItemModal').modal('show');
                    $('#addItemModal').find('.modal-title').text('Edit Item');
                    $('#btnAddItem').text('Edit Item');
                    $('#itemId').val(params.data._id);
                    $('#itemName').val(params.data.name);
                    $('#itemDesc').val(params.data.description);
                    $('#itemQuantity').val(params.data.quantity);
                });

                var delButton = actionDiv.querySelector('.btn-danger');

                delButton.addEventListener('click', function () {
                    $('#deleteItemModal').modal('show');
                    $('#deleteItemId').val(params.data._id);
                });

                return actionDiv;
            }
        },
        { headerName: "Item Name", field: "name", sortable: true },
        { headerName: "Item Description", field: "description", width: '400px', sortable: true },
        { headerName: "Quantity", field: "quantity", sortable: true },
        {
            headerName: "Date Time Added", field: "dateTimeAdded", sortable: true,
            valueFormatter: params => {
                return params.value ? moment(new Date(params.value)).format('DD-MMM-YYYY HH:mm:ss') : '';
            },
            comparator: dateComparator
        }
    ],
    rowSelection: 'single',
    onSelectionChanged: onSelectionChanged,
    pagination: true
};

function dateComparator(date1, date2) {
    if (!date1 && !date2) {
        return 0;
    }
    if (!date1) {
        return -1;
    }
    if (!date2) {
        return 1;
    }
    return (new Date(date1).valueOf() - new Date(date2).valueOf());
}


function onSelectionChanged() {
    let selectedRows = gridOptions.api.getSelectedRows();
    document.querySelector('#selectedItem').innerHTML =
        selectedRows.length === 1 ? selectedRows[0].name : '';
}

function onFilterTextBoxChanged() {
    gridOptions.api.setQuickFilter(document.getElementById('gridQuickFilter').value);
}

function onPageSizeChanged() {
    var value = document.getElementById('page-size').value;
    gridOptions.api.paginationSetPageSize(Number(value));
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {

    let gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.paginationSetPageSize(10);
    loadItemData();

});

$('#addItemModal').on('hidden.bs.modal', function (e) {
    $('#itemName').val('');
    $('#itemDesc').val('');
    $('#itemQuantity').val('');
    $('#itemNameErr').text('');
    $('#itemDescErr').text('');
    $('#itemQuantityErr').text('');
})

$('#btnOpenAddItemModal').on('click', function () {
    $('#itemNameErr').text('');
    $('#itemDescErr').text('');
    $('#itemQuantityErr').text('');
    $('#addItemModal').modal('show'); 
    $('#addItemModal').find('.modal-title').text('New Item');
    $('#btnAddItem').text('Add Item');
});

$('#btnDeleteItem').on('click', function () {
    $.ajax({
        url: '/api/items/' + $('#deleteItemId').val(),
        type: 'DELETE',
        contentType: 'application/json',
        success: function (res) {
            loadItemData();
            finishDeleteModal('Successfully deleted an item', 'success');
        },
        error: function (err) {
            finishDeleteModal(err.responseJSON.title, 'danger');
        }
    });
});

$('#btnAddItem').on('click', function () {
    let itemName = $('#itemName').val();
    let itemDesc = $('#itemDesc').val();
    let itemQuantity = $('#itemQuantity').val();
    $('#itemNameErr').text('');
    $('#itemDescErr').text('');
    $('#itemQuantityErr').text('');

    if (!validateInput(itemName, itemDesc, itemQuantity)) {
        return;
    }

    $('#btnAddItem').hide();
    $('#addItemLoading').show();
    $('#btnCloseModal').prop('disabled', true);

    if ($('#btnAddItem').text() === 'Add Item') {
        $.ajax({
            url: '/api/items',
            data: JSON.stringify({
                name: itemName,
                description: itemDesc,
                quantity: parseInt(itemQuantity),
            }),
            type: 'POST',
            contentType: 'application/json',
            success: function (res) {
                loadItemData();
                finishModal('Add Item', 'Successfully added an item', 'success');
            },
            error: function (err) {
                finishModal('Add Item', err.responseJSON.title, 'danger');
            }
        });
    } else if ($('#btnAddItem').text() === 'Edit Item') {
        $.ajax({
            url: '/api/items/' + $('#itemId').val(),
            data: JSON.stringify({
                name: itemName,
                description: itemDesc,
                quantity: parseInt(itemQuantity),
            }),
            type: 'PUT',
            contentType: 'application/json',
            success: function (res) {
                loadItemData();
                finishModal('Edit Item', 'Successfully edited an item', 'success');
            },
            error: function (err) {
                finishModal('Edit Item', err.responseJSON.title, 'danger');
            }
        });
    }

   
    
});

function validateInput(itemName, itemDesc, itemQuantity) {
    let isValidated = true;
    if (!itemName) {
        $('#itemNameErr').text('Item Name is required');
        isValidated = false;
    }
    if (!itemDesc) {
        $('#itemDescErr').text('Item Description is required');
        isValidated = false;
    }
    if (!itemQuantity) {
        $('#itemQuantityErr').text('Item Quantity is required');
        isValidated = false;
    }
    return isValidated;
}

function finishDeleteModal(title, status) {
    $('#notiToast').toast('show');
    $('#notiToast').addClass('bg-' + status);
    $('#toastTitle').text('Delete Item');
    $('#toastContent').text(title);
    $('#deleteItemModal').modal('hide');
}

function finishModal(title, content, status) {
    $('#notiToast').toast('show');
    $('#notiToast').addClass('bg-' + status);
    $('#toastTitle').text(title);
    $('#toastContent').text(content);
    $('#btnCloseModal').prop('disabled', false);
    $('#btnAddItem').show();
    $('#addItemLoading').hide();

    if (status != 'danger') {
        $('#itemName').val('');
        $('#itemDesc').val('');
        $('#itemQuantity').val('');
        $('#addItemModal').modal('hide');
    }
}

function loadItemData() {
    $.ajax({
        url: '/api/items',
        type: 'GET',
        success: function (res) {
            // specify the data coming from the API
            gridOptions.api.setRowData(res);
        },
        error: function (err) {
            console.log(err);
        }
    });
}
