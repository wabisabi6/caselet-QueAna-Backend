/*

THIS PAGE PROCESSES ALL NECESSARY DATA WHICH CORRESPONDS TO PRODUCTS.

*/

const productSelectField = document.querySelector("#select-product")


const loadProductList=()=>{
    $.ajax({
        url:"/get-product-list",
        method: "get",
        async:true,
        success:function(data){ 
            productList = data.QueryResponse.Item
            productList.forEach((item)=>{
                productSelectField.appendChild(createSelectChild(item.Name,item.Id))   
            })
            // Intialize the Select Picker for searching  
            $('#select-product').selectpicker('refresh');
            console.log(data)

        },
        error:function(error){
            console.log(error)
            // window.location = '/authUri'
        }
    })
    
}

// Load Products
loadProductList();