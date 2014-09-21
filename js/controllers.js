function ListController($scope, $routeParams, sharedService) {
	$scope.activeKey = null
	
	$scope.createNewInvoice = function()
	{
		sharedService.broadcastItem('NewInvoiceMessage', true);
		$scope.invoices = $scope.getAllInvoices();
	}
	
	$scope.saveInvoice = function()
	{
		sharedService.broadcastItem('SaveToPDFInvoiceMessage', true);
		console.log("Create the pdf")
	}
	
	$scope.getAllInvoices = function()
	{
		
		invoices = [];
		
		for (var key in window.localStorage){
		   invoices.push(
			   {
				   key: key, 
				   content: JSON.parse(window.localStorage[key])
			   }
		   )
		}
		return invoices;
	}
	
	$scope.loadInvoice = function(key)
	{
		data = window.localStorage.getItem(key);
		if(data)
			sharedService.broadcastItem('LoadInvoiceMessage', data);
	}
	
	$scope.invoices = $scope.getAllInvoices();

    $scope.$on('SavedInvoiceMessage', function(message, value) {
		$scope.invoices = $scope.getAllInvoices();
    });	

    $scope.$on('SendActiveKey', function(message, value) {
		console.log("test" + value)
		$scope.activeKey = value;
    });
	
}

function ShowController($scope, $routeParams, sharedService, $http) {
	
	d = new Date();
	length = window.localStorage.length;
    if(length == 0)
        current_invoice = null;
    else
        current_invoice = JSON.parse(window.localStorage.getItem(window.localStorage.key(window.localStorage.length-1)));
	
	default_invoice = function () {		
		return {
			filename: null,
            permalink: null,
			timestamp: new Date().getTime(),
			company_name: "Your Company Name",
			company_street: "123 Your Street",
			company_street_second: "Address Line 3",
			company_city: "City / Postal Code",
			company_phone: "888-888-8888",
			company_email: "youremail@yourcompany.com",
			company_number: "Business Number / Tax Number",
		
			invoice_date: d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay(),
			invoice_number: Math.floor(Math.random()*10000000),
		
			receiver_name: "Receiver Name",
			receiver_street: "123 Your Street",
			receiver_street_second: "Address Line 3",
			receiver_city: "City / Postal Code",
			receiver_phone: "999-999-9999",
			receiver_email: "receiveremail@receivercompany.com",
		
			receiver_extra: "Enter Extra Information pertaining to the receiver",
			invoice_message: "Dear Mr. Sixpack,<br/><br/>Please see the cost breakdown structure below for the work completed. Please note, payment is required 30 after receiving this invoice. Do not hesitate to contact us if you have any further questions<br/><br/>Thanks,<br/>Your Name",		
		
			invoice_titles: {
				number: "#", 
				description: "Description of Work", 
				quantity: "Quantity/Hours", 
				price: "Price per Item or per Hour", 
				total: "Total ($)",
			},
		
			invoice_tax: "13%",
		
			invoice_amounts: [
				{number: "1", description: "Work you've completed", quantity: "0", price: "0", total: "0"},
				{number: "2", description: "", quantity: "", price: "", total: ""},
				{number: "3", description: "", quantity: "", price: "", total: ""},
				{number: "4", description: "", quantity: "", price: "", total: ""},
			],
            invoice_subtotal: "0",
            invoice_total: "0",
			invoice_banner: "Thank you for doing business with us.<br/><br/>Your name",
		}
	}


	$scope.invoice = (current_invoice === null)? default_invoice() : current_invoice;
	
    $scope.$watch('invoice', function(newVal) {
		console.log("Saving" + $scope.invoice.timestamp)
		window.localStorage.setItem($scope.invoice.timestamp, JSON.stringify($scope.invoice))
		sharedService.broadcastItem('SavedInvoiceMessage', true);
		sharedService.broadcastItem('SendActiveKey', $scope.invoice.timestamp);
    }, true);
	
	calculateSubtotal = function()
	{
		total = 0;
		for(i=0; i < $scope.invoice.invoice_amounts.length; i++)
		{
			if(!isNaN($scope.invoice.invoice_amounts[i].total))
				total += Number($scope.invoice.invoice_amounts[i].total);
		}
		return total;		
	}
	
	
	$scope.getSubtotal = function()
	{
		$scope.invoice.invoice_subtotal = $scope.getCurrencyFormat(calculateSubtotal(),"");
        return $scope.invoice.invoice_subtotal;
	}

	$scope.getTotal = function()
	{	
		$scope.invoice.invoice_total = $scope.getCurrencyFormat(calculateSubtotal() * (Number($scope.invoice.invoice_tax.split("%")[0])/100+1), "")
        return $scope.invoice.invoice_total;
	}
	
	$scope.getRowTotal = function(key)
	{
		total = 0;
		if(!isNaN($scope.invoice.invoice_amounts[key].price) && !isNaN($scope.invoice.invoice_amounts[key].quantity))
		{
			total = Number($scope.invoice.invoice_amounts[key].price) * Number($scope.invoice.invoice_amounts[key].quantity)
			$scope.invoice.invoice_amounts[key].total = total;
		}
		else
			$scope.invoice.invoice_amounts[key].total = "0";
		
		return $scope.getCurrencyFormat($scope.invoice.invoice_amounts[key].total, "")
	}

	
	$scope.getCurrencyFormat = function(n,currency)
	{
	    return currency + " " + n.toFixed(2).replace(/./g, function(c, i, a) {
	        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
	    });		
	}

	$scope.removeInvoiceRow = function()
	{
		$scope.invoice.invoice_amounts.pop()
	}	


	$scope.addInvoiceRow = function()
	{
		$scope.invoice.invoice_amounts.push({number: "", description: "", quantity: "", price: "", total: ""})
	}
	
	
    $scope.$on('NewInvoiceMessage', function(message, value) {
		$scope.save()
		$scope.reset();
    });	
	
    $scope.$on('LoadInvoiceMessage', function(message, value) {
		$scope.load(value)
    });	
	
	$scope.load = function(data)
	{
		$scope.save()
		$scope.reset();
		$scope.invoice = JSON.parse(data);
	}
	
	$scope.save = function()
	{
		window.localStorage.setItem($scope.invoice.timestamp, JSON.stringify($scope.invoice))
	}
	
	$scope.reset = function()
	{
		console.log("New Invoice")
		$scope.invoice = default_invoice();
		//localStorage.setItem($scope.invoice.timestamp, JSON.stringify($scope.invoice))
	}

	$scope.getPDFLink = function()
	{
		$http.post("/invoice.php", {data: JSON.stringify($scope.invoice)}).success(
		    function(response) {
		        $scope.invoice.filename = response.filename;
		    	window.prompt("Here's the link to the invoice, enjoy!", "http://" + window.location.host + "/" + response.filename);
		    }
		);		
	}

	$scope.downloadPDF = function()
	{
		sharedService.broadcastItem('SaveToPDFInvoiceMessage', true);
	}
	
	$scope.duplicateInvoice = function()
	{
		current_invoice = $scope.invoice
		sharedService.broadcastItem('NewInvoiceMessage', true)
		current_invoice.invoice_number = $scope.invoice.invoice_number
		current_invoice.timestamp = $scope.invoice.timestamp
		$scope.invoice = current_invoice
	}

	$scope.getPermalink = function()
	{

        $http.post("/permalink.php", {data: JSON.stringify($scope.invoice)}).success(
		    function(response) {
		        $scope.invoice.filename = response.filename;
		    	window.prompt("Here's the link to the invoice, enjoy!", "http://" + window.location.host + "" + response.url);
		    }
		);	

    }
	
	$scope.removeInvoice = function()
	{
		result = confirm("Are you sure you want to delete this invoice?");
		if (result == true)
		{
			if(window.localStorage.length > 1)
			{
				window.localStorage.removeItem($scope.invoice.timestamp);
				$scope.invoice = current_invoice = JSON.parse(window.localStorage.getItem(window.localStorage.key(window.localStorage.length-1)));

			}		
		}
	}

	$scope.$on('SaveToPDFInvoiceMessage', function(message, value) {
		//$.post("test.php", { name: "John", time: "2pm" } );
		$http.post("/invoice.php", {data: JSON.stringify($scope.invoice)}).success(
		    function(response) {
                console.log(response.filename)
		        $scope.invoice.filename = response.filename;
                window.location = "http://" + window.location.host + "/" + response.filename, '_blank';
		    }
		);
    });
  //$scope.phoneId = $routeParams.phoneId;
}


ListController.$inject = ['$scope','$routeParams', 'SharedBroadcast']; 
ShowController.$inject = ['$scope','$routeParams', 'SharedBroadcast', '$http']; 
