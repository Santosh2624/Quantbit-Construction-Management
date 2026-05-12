// Copyright (c) 2026, QTPL and contributors
// For license information, please see license.txt


frappe.ui.form.on("Tender", {
    refresh:function(frm){
        frm.set_query("opportunity_from", function () {
			return {
				filters: {
					name: ["in", ["Customer", "Lead"]],
				},
			};
		});

        
        if (frm.doc.show_create_customer_button == 1) {
            frm.add_custom_button(__('Create Customer'), function() {
                create_customer_from_lead(frm);
            });
        }

        
        console.log("Checking workflow state for Create Project button:", frm.doc.workflow_state);
        if (frm.doc.workflow_state == "Alloted") {
            console.log("Adding Create Project button");
            frm.add_custom_button(__('Create Project'), function() {
                console.log("Create Project button clicked");
                show_project_creation_dialog(frm);
            });
        } else {
            console.log("Not adding Create Project button - workflow state is not Alloted");
        }
    },
    total_ctc: function(frm) {
        calculate_contract_values(frm);
    },

    profit_on_ctc: function(frm) {
        calculate_contract_values(frm);
    }
});

function calculate_contract_values(frm) {
    if (frm.doc.total_ctc && frm.doc.profit_on_ctc) {

        let contract_value = frm.doc.total_ctc * (1 + (frm.doc.profit_on_ctc / 100));
        let profit_margin = contract_value - frm.doc.total_ctc;
        let net_profit_margin = contract_value
            ? (profit_margin / contract_value) * 100
            : 0;

        frm.set_value("contract_value", contract_value);
        frm.set_value("profit_margin", profit_margin);
        frm.set_value("net_profit_margin", net_profit_margin);

    } else {
        frm.set_value("contract_value", 0);
        frm.set_value("profit_margin", 0);
        frm.set_value("net_profit_margin", 0);
    }
}

function create_customer_from_lead(frm) {
    frappe.call({
        method: 'create_customer_from_lead',
        doc: frm.doc,
        callback: function(r) {
            if (r.message) {
                frappe.show_alert({
                    message: r.message.message,
                    indicator: 'green'
                });
                
                
                frm.reload_doc();
            }
        },
        error: function(r) {
            frappe.show_alert({
                message: __('Error creating customer: ') + (r.responseJSON ? r.responseJSON.exc_type : r.statusText),
                indicator: 'red'
            });
        }
    });
}


window.show_project_creation_dialog = show_project_creation_dialog;

function show_project_creation_dialog(frm) {
    console.log("show_project_creation_dialog function called");
    console.log("Creating dialog...");
    
    var d = new frappe.ui.Dialog({
        title: 'Create Project',
        fields: [
            {
                fieldname: 'project_name',
                label: 'Project Name',
                fieldtype: 'Data',
                reqd: 1,
                default: frm.doc.name,
                change: function() {
                    var value = d.get_value('project_name');
                    console.log("User entered project name:", value);
                }
            }
        ]
    });
    
    
    d.set_primary_action('Create Project Document', function() {
        console.log("BUTTON CLICKED! Action function is working!");
        console.log("=== DIALOG SUBMIT ACTION STARTED ===");
        var project_name = d.get_value('project_name');
        console.log("Create Project button clicked with project_name:", project_name);
        console.log("Tender name:", frm.doc.name);
        console.log("Project name type:", typeof project_name);
        console.log("Project name length:", project_name ? project_name.length : 'null');
        
        if (project_name && project_name.trim() !== '') {
            console.log("Project name is valid, making frappe.call...");
            frappe.call({
                method: 'quantbit_construction_management.tendering.doctype.tender.tender.create_project_from_tender',
                args: {
                    tender_name: frm.doc.name,
                    project_name: project_name
                },
                callback: function(response) {
                    console.log("=== SERVER RESPONSE RECEIVED ===");
                    console.log("Full response object:", response);
                    console.log("Response.message:", response.message);
                    console.log("Response.message type:", typeof response.message);
                    
                    if (response && response.message) {
                        console.log("Success! Project created successfully");
                        frappe.show_alert({
                            message: response.message.message,
                            indicator: 'green'
                        });
                        d.hide();
                        
                        frm.reload_doc();
                    } else {
                        console.log("ERROR: No response or message from server");
                        frappe.show_alert({
                            message: 'No response from server',
                            indicator: 'red'
                        });
                    }
                },
                error: function(r) {
                    console.log("=== SERVER ERROR ===");
                    console.log("Error object:", r);
                    console.log("Error responseJSON:", r.responseJSON);
                    console.log("Error status:", r.status);
                    console.log("Error statusText:", r.statusText);
                    frappe.show_alert({
                        message: __('Error creating project: ') + (r.responseJSON ? r.responseJSON.exc_type : r.statusText),
                        indicator: 'red'
                    });
                }
            });
        } else {
            console.log("ERROR: Project name is empty or invalid");
            frappe.show_alert({
                message: 'Project name is required',
                indicator: 'red'
            });
        }
        console.log("=== DIALOG SUBMIT ACTION COMPLETED ===");
    });
    
    console.log("Dialog created, showing dialog...");
    d.show();
    console.log("Dialog shown");
}
