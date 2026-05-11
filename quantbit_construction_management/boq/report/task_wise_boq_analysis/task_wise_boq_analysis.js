// Copyright (c) 2026, QTPL and contributors
// For license information, please see license.txt

frappe.query_reports["Task Wise BOQ Analysis"] = {
	filters: [
		       {
            fieldname: "bill_of_quantities",
            label: __("Bill Of Quantities"),
            fieldtype: "Link",
            options: "Bill of Quantities",
            reqd: 1
        }

	
	],
    // get_datatable_options(options) {
    //     return Object.assign(options, {
    //         serialNoColumn: false
    //     });
    // }
    

};
