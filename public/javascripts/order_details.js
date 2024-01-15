// get table
const orderTable = document.querySelector("#order-table tbody")

const createTableRow =(order)=>{
    const tableRow = document.createElement("tr")
    date_of_delivery = new Date(order.date_of_delivery)
    tableRow.innerHTML=`
    <td>${order.order_id}</td>
    <td>${order.product}</td>
    <td>${order.store_name}</td>
    <td>${order.quantity}</td>
    <td>${order.price}</td>
    <td>${date_of_delivery.toLocaleDateString()}</td
    `
    return tableRow
}

const getOrderList =()=>{
    $.ajax({
        url:"/fetch-completed-orders",
        method:"get",
        success:function(data){
            data.order.forEach(order => {
                orderTable.appendChild(createTableRow(order))

                
            });

            $(document).ready(function () {
                $('#order-table').DataTable();
                $('.dataTables_length').addClass('bs-select');
            });
        },
        error:function(data){
            console.log(data)
        }
        
    })
}

getOrderList()