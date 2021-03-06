$(function () {
    $("#jqGrid").jqGrid({
        url: '../sys/oss/list',
        datatype: "json",
        colModel: [			
			{ label: 'id', name: 'id', width: 20, key: true },
            { label: '学号', name: 'stuNo', width: 100},
            { label: '姓名', name: 'stuName', width: 30},
            { label: '专业', name: 'major', wdith: 50}
        ],
		viewrecords: true,
        height: 385,
        rowNum: 10,
		rowList : [10,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth:true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader : {
            root: "page.list",
            page: "page.currPage",
            total: "page.totalPage",
            records: "page.totalCount"
        },
        prmNames : {
            page:"page", 
            rows:"limit", 
            order: "order"
        },
        gridComplete:function(){
        	//隐藏grid底部滚动条
        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
        }
    });

    new AjaxUpload('#upload', {
        action: '../sys/oss/upload',
        name: 'file',
        autoSubmit:true,
        responseType:"json",
        onSubmit:function(file, extension){
            if (!(extension && /^(pdf|doc|docx)$/.test(extension.toLowerCase()))){
                alert('只支持pdf,doc,docx格式的文档！');
                return false;
            }
        },
        onComplete : function(file, r){
            if(r.code == 0){
                vm.uploadInfo.filePath = r.filePath;
                alert("文件上传成功");
            } else {
                alert(r.msg);
            }
        }
    });

});

var vm = new Vue({
	el:'#rrapp',
	data:{
	    // 1展示列表，2展示上传配置，3展示上传信息面板
		showType: 1,
        isShowUploadPanel: false,
        uploadTitle: null,
		title: null,
        config: {},
        uploadInfo: {}
	},
    created: function(){
        this.getConfig();
    },
	methods: {
		query: function () {
			vm.reload();
		},
		getConfig: function () {
            $.getJSON("../sys/oss/config", function(r){
                vm.config = r.config;
            });
        },
        cancel: function () {
            vm.showType = 1;
        },
        getUploadInfo: function () {
            $.getJSON("../sys/oss/uploadInfo", function (r) {
                vm.uploadInfo = r.uploadInfo;
            })
        },
        addNewRecord: function () {
            var record = this._data.uploadInfo;
            var url = '../sys/oss/add';
            for (var key in record) {
                if (!record[key]) {
                    alert(key + '不应该为空');
                }
            }
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json",
                data: JSON.stringify(record),
                success: function (r) {
                    if (r.code === 0) {
                        alert('保存数据成功', function () {
                            vm.uploadInfo = {};
                            vm.showType = 1;
                            vm.reload();
                        })
                    } else {
                        alert(r.message);
                    }
                }
            })
        },
        openUploadPanel: function () {
            vm.showType = 3;
            vm.uploadTitle = "上传信息";
        },
		addConfig: function(){
			vm.showType = 2;
			vm.title = "云存储配置";
		},
		saveOrUpdate: function () {
			var url = "../sys/oss/saveConfig";
			$.ajax({
				type: "POST",
			    url: url,
                contentType: "application/json",
			    data: JSON.stringify(vm.config),
			    success: function(r){
			    	if(r.code === 0){
						alert('操作成功', function(){
							vm.reload();
						});
					}else{
						alert(r.msg);
					}
				}
			});
		},
        del: function () {
            var ossIds = getSelectedRows();
            if(ossIds == null){
                return ;
            }

            confirm('确定要删除选中的记录？', function(){
                $.ajax({
                    type: "POST",
                    url: "../sys/oss/delete",
                    contentType: "application/json",
                    data: JSON.stringify(ossIds),
                    success: function(r){
                        if(r.code === 0){
                            alert('操作成功', function(){
                                vm.reload();
                            });
                        }else{
                            alert(r.msg);
                        }
                    }
                });
            });
        },
		reload: function () {
			vm.showList = true;
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{ 
                page:page
            }).trigger("reloadGrid");
		}
	}
});