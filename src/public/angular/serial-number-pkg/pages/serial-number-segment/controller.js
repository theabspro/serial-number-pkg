app.component('serialNumberSegmentList', {
    templateUrl: serial_number_segment_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $location) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        var table_scroll;
        table_scroll = $('.page-main-content').height() - 37;
        var dataTable = $('#serial_number_segment').DataTable({
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
            stateSaveCallback: function(settings, data) {
                localStorage.setItem('SDataTables_' + settings.sInstance, JSON.stringify(data));
            },
            stateLoadCallback: function(settings) {
                var state_save_val = JSON.parse(localStorage.getItem('SDataTables_' + settings.sInstance));
                if (state_save_val) {
                    $('#search_serial_number_segment').val(state_save_val.search.search);
                }
                return JSON.parse(localStorage.getItem('SDataTables_' + settings.sInstance));
            },
            paging: true,
            stateSave: true,
            ordering: false,
            scrollY: table_scroll + "px",
            scrollCollapse: true,
            ajax: {
                url: laravel_routes['getSerialNumberSegmentList'],
                type: "GET",
                dataType: "json",
                data: function(d) {},
            },

            columns: [

                { data: 'action', class: 'action', name: 'action', searchable: false },
                { data: 'name', name: 'serial_number_segments.name' },
                { data: 'type', name: 'configs.name' },
                // { data: 'status', searchable: false },
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

        $scope.clear_search = function() {
            $('#search_serial_number_segment').val('');
            $('#serial_number_segment').DataTable().search('').draw();
        }

        var dataTables = $('#serial_number_segment').dataTable();
        $("#search_serial_number_segment").keyup(function() {
            dataTables.fnFilter(this.value);
        });

        $scope.deleteSerialNumberType = function($id) {
            $('#serial_number_segment_id').val($id);
        }
        $scope.deleteConfirm = function() {
            $id = $('#serial_number_segment_id').val();
            $http.get(
                serial_number_segment_delete_data_url + '/' + $id,
            ).then(function(response) {
                if (response.data.success) {
                    $noty = new Noty({
                        type: 'success',
                        layout: 'topRight',
                        text: 'Serial Number Segment Deleted Successfully',
                    }).show();
                    setTimeout(function() {
                        $noty.close();
                    }, 3000);
                    $('#serial_number_segment').DataTable().ajax.reload(function(json) {});
                    $location.path('/serial-number-pkg/serial-number-segment/list');
                }
            });
        }
        $rootScope.loading = false;
    }
});
//------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------
app.component('serialNumberSegmentForm', {
    templateUrl: serial_number_segment_form_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope) {
        get_form_data_url = typeof($routeParams.id) == 'undefined' ? serial_number_segment_get_form_data_url : serial_number_segment_get_form_data_url + '/' + $routeParams.id;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        self.angular_routes = angular_routes;
        $http.get(
            get_form_data_url
        ).then(function(response) {
            console.log(response);
            self.serial_number_segment = response.data.serial_number_segment;
            self.type_list = response.data.type_list;
            self.action = response.data.action;
            if (response.data.action == 'Edit') {
                if (response.data.serial_number_segment[0].deleted_at) {
                    self.serial_number_segment = [];
                    self.serial_number_segment.push({
                        id: response.data.serial_number_segment[0].id,
                        name: response.data.serial_number_segment[0].name,
                        data_type_id: response.data.serial_number_segment[0].data_type_id,
                        switch_value: 'Inactive',
                    });
                } else {
                    self.serial_number_segment = [];
                    self.serial_number_segment.push({
                        id: response.data.serial_number_segment[0].id,
                        name: response.data.serial_number_segment[0].name,
                        data_type_id: response.data.serial_number_segment[0].data_type_id,
                        switch_value: 'Active',
                    });
                }
            } else {
                $scope.add_segment();
            }
            $rootScope.loading = false;
        });
        //ADD SEGMENT
        $scope.add_segment = function() {
            self.serial_number_segment.push({
                switch_value: 'Active',
            });
        }
        //REMOVE SEGMENT 
        $scope.removeSegment = function(index, segment_id) {
            console.log(index, segment_id);
            if (segment_id) {
                self.segment_removal_id.push(segment_id);
                $('#segment_removal_id').val(JSON.stringify(self.segment_removal_id));
            }
            self.serial_number_segment.splice(index, 1);
        }

        // $(document).ready(function() {
        //     var segments = $('input[name^="segment"]');
        //     segments.filter('input[name$="[name]"]').each(function() {
        //         $(this).rules("add", {
        //             required: true,
        //             minlength: 3,
        //             maxlength: 191,
        //         });
        //     });
        //     segments.filter('input[name$="[data_type_id]"]').each(function() {
        //         $(this).rules("add", {
        //             required: true,
        //         });
        //     });
        // });

        //VALIDATEOR FOR MULTIPLE 
        $.validator.messages.minlength = 'Minimum of 3 charaters';
        $.validator.messages.maxlength = 'Maximum of 191 charaters';
        jQuery.validator.addClassRules("segment_name", {
            required: true,
            minlength: 3,
            maxlength: 191,
        });

        var form_id = '#form';
        var v = jQuery(form_id).validate({
            ignore: '',
            submitHandler: function(form) {
                let formData = new FormData($(form_id)[0]);
                $('#submit').button('loading');
                $.ajax({
                        url: laravel_routes['saveSerialNumberSegment'],
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
                            $location.path('/serial-number-pkg/serial-number-segment/list');
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
                                $location.path('/serial-number-pkg/serial-number-segment/list');
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