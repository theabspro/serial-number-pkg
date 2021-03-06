app.component('serialNumberGroupList', {
    templateUrl: serial_number_group_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $location, $mdSelect) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        $http.get(
            get_serial_number_group_filter_url
        ).then(function(response) {
            self.category_list = response.data.category_list;
            self.financial_year_list = response.data.financial_year_list;
            self.state_list = response.data.state_list;
            self.branch_list = [];
            $rootScope.loading = false;
        });

        var table_scroll;
        table_scroll = $('.page-main-content').height() - 37;
        var dataTable = $('#serial_number_group').DataTable({
            "dom": cndn_dom_structure,
            "language": {
                //"search": "",
                //"searchPlaceholder": "Search",
                "lengthMenu": "Rows _MENU_",
                "paginate": {
                    "next": '<i class="icon ion-ios-arrow-forward"></i>',
                    "previous": '<i class="icon ion-ios-arrow-back"></i>'
                },
            },
            pageLength: 10,
            processing: true,
            serverSide: true,
            paging: true,
            stateSave: true,
            stateSaveCallback: function(settings, data) {
                localStorage.setItem('SGDataTables_' + settings.sInstance, JSON.stringify(data));
            },
            stateLoadCallback: function(settings) {
                var state_save_val = JSON.parse(localStorage.getItem('SGDataTables_' + settings.sInstance));
                if (state_save_val) {
                    $('#search_serial_number_group').val(state_save_val.search.search);
                }
                return JSON.parse(localStorage.getItem('SGDataTables_' + settings.sInstance));
            },
            scrollX: true,
            ordering: false,
            scrollY: table_scroll + "px",
            scrollCollapse: true,
            ajax: {
                url: laravel_routes['getSerialNumberGroupList'],
                type: "GET",
                dataType: "json",
                data: function(d) {
                    d.category_id = $('#category_id').val();
                    d.financial_year_id = $('#financial_year_id').val();
                    d.state_id = $('#state_id').val();
                    d.branch_id = $('#branch_id').val();
                },
            },

            columns: [
                { data: 'action', class: 'action', name: 'action', searchable: false },
                { data: 'name', name: 'serial_number_categories.name' },
                { data: 'finance_year', name: 'financial_years.name', searchable: false },
                { data: 'state', name: 'states.name' },
                { data: 'branch', name: 'outlets.name' },
                { data: 'starting_number', name: 'starting_number' },
                { data: 'ending_number', name: 'ending_number' },
                { data: 'next_number', name: 'next_number' },
                { data: 'segment', name: 'segment', searchable: false },
            ],
            infoCallback: function(settings, start, end, max, total, pre) {
                $('#table_info').html(total)
                $('.foot_info').html('Showing ' + start + ' to ' + end + ' of ' + max + ' entries')
            },
            rowCallback: function(row, data) {
                $(row).addClass('highlight-row');
            }
        });
        $('.dataTables_length select').select2();
        $('.modal').bind('click', function(event) {
            if ($('.md-select-menu-container').hasClass('md-active')) {
                $mdSelect.hide();
            }
        });
        $scope.clear_search = function() {
            $('#search_serial_number_group').val('');
            $('#serial_number_group').DataTable().search('').draw();
        }

        $scope.onSelectedType = function(selected_type) {
            setTimeout(function() {
                $('#category_id').val(selected_type);
                dataTable.draw();
            }, 900);
        }
        $scope.onSelectedFinancialYear = function(selected_financial_year) {
            setTimeout(function() {
                $('#financial_year_id').val(selected_financial_year);
                dataTable.draw();
            }, 900);
        }
        $scope.onSelectedBranch = function(selected_branch) {
            setTimeout(function() {
                $('#branch_id').val(selected_branch);
                dataTable.draw();
            }, 900);
        }

        //SHOW BRANCH BASED STATE
        $scope.onSelectedState = function($id) {
            setTimeout(function() {
                if ($id == "") {
                    $('#branch_id').val('');
                }
                $('#state_id').val($id);
                dataTable.draw();
                $http.get(
                    get_branch_based_state_url + '/' + $id
                ).then(function(response) {
                    // console.log(response);
                    self.branch_list = response.data.branch_list;
                });
            }, 900);
        }

        var dataTables = $('#serial_number_group').dataTable();
        $("#search_serial_number_group").keyup(function() {
            dataTables.fnFilter(this.value);
        });

        $scope.deleteSerialNumberType = function($id) {
            $('#serial_number_group_id').val($id);
        }
        $scope.deleteConfirm = function() {
            $id = $('#serial_number_group_id').val();
            $http.get(
                serial_number_group_delete_data_url + '/' + $id,
            ).then(function(response) {
                if (response.data.success) {
                    $noty = new Noty({
                        type: 'success',
                        layout: 'topRight',
                        text: 'Serial Number Group Deleted Successfully',
                    }).show();
                    setTimeout(function() {
                        $noty.close();
                    }, 3000);
                    $('#serial_number_group').DataTable().ajax.reload(function(json) {});
                    $location.path('/serial-number-pkg/serial-number-group/list');
                }
            });
        }
        $rootScope.loading = false;
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('serialNumberGroupForm', {
    templateUrl: serial_number_group_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        get_form_data_url = typeof($routeParams.id) == 'undefined' ? serial_number_group_get_form_data_url : serial_number_group_get_form_data_url + '/' + $routeParams.id;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.angular_routes = angular_routes;
        $http.get(
            get_form_data_url
        ).then(function(response) {
            console.log(response);
            self.serial_number_group = response.data.serial_number_group;
            self.category_list = response.data.category_list;
            self.type_list = response.data.type_list;
            self.state_list = response.data.state_list;
            self.financial_year_list = response.data.financial_year_list;
            self.action = response.data.action;
            if (response.data.action == 'Edit') {
                self.branch_list = response.data.branch_list;
                if (self.serial_number_group.deleted_at) {
                    self.switch_value = 'Inactive';
                } else {
                    self.switch_value = 'Active';
                }

                $scope.showCategoryinSegmentTab(self.serial_number_group.category_id);
                $scope.showFinanceYear(self.serial_number_group.fy_id);
                $scope.showBranchCode(self.serial_number_group.branch_id);
                $scope.onSelectedState(self.serial_number_group.state_id);
                $.each(self.serial_number_group.segments, function(index, value) {
                    $scope.getSegmentgroupSegment(value.id, index);
                    if (value.data_type_id == 1140) {
                        $(".segmentValue").text(value.pivot.value);
                    }
                });
            } else {
                self.serial_number_group.segments = [];
                $scope.add_group();
                self.switch_value = 'Active';
            }
            $rootScope.loading = false;
        });

        $scope.showCategoryinSegmentTab = function($id) {
            if ($id) {
                $.each(self.category_list, function(index, value) {
                    if ($id == value.id) {
                        self.category_name_based_groupTab = value.name;
                    }
                });
            } else {
                self.category_name_based_groupTab = '';
            }
        }
        $scope.showFinanceYear = function($id) {
            if ($id) {
                $.each(self.financial_year_list, function(index, value) {
                    if ($id == value.id) {
                        self.finance_year_based_groupTab = value.code;
                    }
                });
            } else {
                self.finance_year_based_groupTab = '';
            }
        }
        $scope.showBranchCode = function($id) {
            if ($id) {
                $.each(self.branch_list, function(index, value) {
                    if ($id == value.id) {
                        self.branch_based_groupTab = value.code;
                    }
                });
            } else {
                self.branch_based_groupTab = '';
            }
        }

        //GET VALUE BASED SEGMENT
        $scope.getSegmentgroupSegment = function(id, index) {
            var required_remove = ".hidden_based_segment_" + index;
            if (id) {
                $http.get(
                    get_segment_based_on_change_data_url + '/' + id
                ).then(function(response) {
                    // console.log(response);
                    var data_type_id = response.data.data_type_id;
                    if (data_type_id == 1140) {
                        $(".hidden_based_segment_" + index).css('display', 'block');
                        $(required_remove).addClass('required');
                        $(document).on("input", ".append_segVal", function() {
                            console.log("IN");
                            var append_segVal = $(this).closest('tr').find('.append_segVal').val();
                            if (append_segVal.length > 0) {
                                $(".segmentValue").text(append_segVal);
                            } else {
                                $(".segmentValue").text('');
                            }
                            console.log(self.segmentValue);
                        });
                    } else if (data_type_id == 1141) {
                        self.financial_year = self.finance_year_based_groupTab;
                        $(".hidden_based_segment_" + index).css('display', 'none');
                        $(required_remove).removeClass('required');
                    } else if (data_type_id == 1142) {
                        self.state_code = self.state_based_groupTab;
                        $(".hidden_based_segment_" + index).css('display', 'none');
                        $(required_remove).removeClass('required');
                    } else if (data_type_id == 1143) {
                        self.branch_code = self.branch_based_groupTab;
                        $(".hidden_based_segment_" + index).css('display', 'none');
                        $(required_remove).removeClass('required');
                    } else {
                        $(".hidden_based_segment_" + index).css('display', 'none');
                        $(required_remove).removeClass('required');
                    }
                });
            }
        }

        // //SHOW BASED ORDER
        // test = [];
        // $scope.orderChange = function(index) {
        //     console.log(index, $(".orderCheck_" + index).val());
        //     if ($(".orderCheck_" + index).val()) {
        //         test.push($(".orderCheck_" + index).val());
        //     } else {
        //         var removeItem = $(".orderCheck_" + index).val();
        //         console.log(removeItem);
        //         var y = jQuery.grep(test, function(value) {
        //             return value != removeItem;
        //         });
        //         // test.splice($(".orderCheck_" + index).val(), 1);
        //     }
        //     console.log(test);
        // }

        /* Tab Funtion */
        $('.btn-nxt').on("click", function() {
            $('.cndn-tabs li.active').next().children('a').trigger("click");
            tabPaneFooter();
        });
        $('.btn-prev').on("click", function() {
            $('.cndn-tabs li.active').prev().children('a').trigger("click");
            tabPaneFooter();
        });
        $('.btn-pills').on("click", function() {
            tabPaneFooter();
        });
        $scope.btnNxt = function() {}
        $scope.prev = function() {}

        //SHOW BRANCH BASED STATE
        $scope.onSelectedState = function($id) {
            if ($id) {
                $.each(self.state_list, function(index, value) {
                    if ($id == value.id) {
                        self.state_based_groupTab = value.code;
                    }
                });
            } else {
                self.state_based_groupTab = '';
            }
            $http.get(
                get_branch_based_state_url + '/' + $id
            ).then(function(response) {
                // console.log(response);
                self.branch_list = response.data.branch_list;
            });
        }
        //ADD SEGMENT
        $scope.add_group = function() {
            self.serial_number_group.segments.push({});
        }
        //REMOVE SEGMENT 
        $scope.removeGroup = function(index) {
            // if (segment_id) {
            //     self.segment_removal_id.push(segment_id);
            //     $('#segment_removal_id').val(JSON.stringify(self.segment_removal_id));
            // }
            self.serial_number_group.segments.splice(index, 1);
        }

        //ADDED RULES FOR VALIDATING START NUMBER,END NUMBER AND NEXT NUMBER
        //END NUMBER VALIDATION
        $.validator.addMethod('greaterThan', function(value, element, param) {
            var i = parseInt(value);
            var j = parseInt($(param).val());
            return i > j;
        }, "Must be greater than the Starting Number");

        //NEXT NUMBER VALIDATION
        $.validator.addMethod('minimumStart', function(value, element, param) {
            var i = parseInt(value);
            var j = parseInt($(param).val());
            return i >= j;
        }, "Must be greater than the Starting Number");
        $.validator.addMethod('maximumEnd', function(value, element, param) {
            var i = parseInt(value);
            var j = parseInt($(param).val());
            return i <= j;
        }, "Must be lesser than the Ending Number");

        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: '',
            rules: {
                'starting_number': {
                    required: true
                },
                'ending_number': {
                    required: true,
                    greaterThan: "#starting_number"
                },
                'next_number': {
                    required: true,
                    minimumStart: "#starting_number",
                    maximumEnd: "#ending_number"
                },
            },
            invalidHandler: function(event, validator) {
                $noty = new Noty({
                    type: 'error',
                    layout: 'topRight',
                    text: 'You have errors,Please check all tabs'
                }).show();
                setTimeout(function() {
                    $noty.close();
                }, 3000)
            },
            errorPlacement: function(error, element) {
                if (element.attr('name') == 'ending_number') {
                    error.appendTo($('.ending_number_error'));
                } else if (element.attr('name') == 'next_number') {
                    error.appendTo($('.next_number_error'));
                } else {
                    error.insertAfter(element)
                }
            },
            submitHandler: function(form) {
                let formData = new FormData($(form_id)[0]);
                $('#submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveSerialNumberGroup'],
                        method: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                    })
                    .done(function(res) {
                        if (res.success == true) {
                            $noty = new Noty({
                                type: 'success',
                                layout: 'topRight',
                                text: res.message,
                            }).show();
                            setTimeout(function() {
                                $noty.close();
                            }, 3000);
                            $location.path('/serial-number-pkg/serial-number-group/list');
                            $scope.$apply();
                        } else {
                            if (!res.success == true) {
                                $('#submit').button('reset');
                                var errors = '';
                                for (var i in res.errors) {
                                    errors += '<li>' + res.errors[i] + '</li>';
                                }
                                $noty = new Noty({
                                    type: 'error',
                                    layout: 'topRight',
                                    text: errors
                                }).show();
                                setTimeout(function() {
                                    $noty.close();
                                }, 3000);
                            } else {
                                $('#submit').button('reset');
                                $location.path('/serial-number-pkg/serial-number-group/list');
                                $scope.$apply();
                            }
                        }
                    })
                    .fail(function(xhr) {
                        $('#submit').button('reset');
                        $noty = new Noty({
                            type: 'error',
                            layout: 'topRight',
                            text: 'Something went wrong at server',
                        }).show();
                        setTimeout(function() {
                            $noty.close();
                        }, 3000);
                    });
            }
        });
    }
});