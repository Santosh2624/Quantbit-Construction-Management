// Copyright (c) 2026, QTPL and contributors
// For license information, please see license.txt

frappe.query_reports["BOQ Analysis Report"] = {
	filters: [
		{
            fieldname: "bill_of_quantities",
            label: __("Bill Of Quantities"),
            fieldtype: "Link",
            options: "Bill of Quantities",
            reqd: 1
        }
	
	],
};
