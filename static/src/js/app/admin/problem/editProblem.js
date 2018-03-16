require(["jquery", "avalon", "editor", "uploader", "bsAlert",
        "csrfToken", "tagEditor", "validator", "jqueryUI", "editorComponent", "testCaseUploader", "spj"],
    function ($, avalon, editor, uploader, bsAlert, csrfTokenHeader) {

        var ajaxData = {};
        var ptagid ;
        avalon.ready(function () {

            $("#edit-problem-form").validator()
                .on('submit', function (e) {
                    if (!e.isDefaultPrevented()) {
                        if (!avalon.vmodels.testCaseUploader.uploaded) {
                            bsAlert("你还没有上传测试数据!");
                            return false;
                        }
                        if (avalon.vmodels.problemDescriptionEditor.content == "") {
                            bsAlert("题目描述不能为空!");
                            return false;
                        }
                        if (vm.timeLimit < 1 || vm.timeLimit > 10000) {
                            bsAlert("保证时间限制是一个1-10000的整数");
                            return false;
                        }
                        if (vm.memoryLimit < 16) {
                            bsAlert("最低内存不能低于16M(注意:Java最低需要内存32M)");
                            return false;
                        }
                        if (vm.samples.length == 0) {
                            bsAlert("请至少添加一组样例!");
                            return false;
                        }
                        for (var i = 0; i < vm.samples.length; i++) {
                            if (vm.samples[i].input == "" || vm.samples[i].output == "") {
                                bsAlert("样例输入与样例输出不能为空！");
                                return false;
                            }
                        }
                        var tags = $("#tags").tagEditor("getTags")[0].tags;
                        if (tags.length == 0) {
                            bsAlert("请至少添加一个标签，这将有利于用户发现你的题目!");
                            return false;
                        }
                        var spjVM = avalon.vmodels.spjConfig;
                        if (spjVM.spj && !spjVM.spjCode){
                            bsAlert("请填写Special Judge的代码");
                            return false;
                        }

                        ajaxData = {
                            id: avalon.vmodels.admin.problemId,
                            title: vm.title,
                            description: avalon.vmodels.problemDescriptionEditor.content,
                            time_limit: vm.timeLimit,
                            memory_limit: vm.memoryLimit,
                            samples: [],
                            test_case_id: avalon.vmodels.testCaseUploader.testCaseId,
                            hint: avalon.vmodels.problemHintEditor.content,
                            source: vm.source,
                            visible: vm.visible,
                            tags: tags,
                            ptag: ptagid,
                            input_description: vm.inputDescription,
                            output_description: vm.outputDescription,
                            difficulty: vm.difficulty,
                            spj: spjVM.spj
                        };
                        if (spjVM.spj) {
                            ajaxData.spj_language = spjVM.spjLanguage;
                            ajaxData.spj_code = spjVM.spjCode;
                        }

                        for (var i = 0; i < vm.samples.$model.length; i++) {
                            ajaxData.samples.push({
                                input: vm.samples.$model[i].input,
                                output: vm.samples.$model[i].output
                            });
                        }
                        $.ajax({
                            beforeSend: csrfTokenHeader,
                            url: "/api/admin/problem/",
                            dataType: "json",
                            data: JSON.stringify(ajaxData),
                            method: "put",
                            contentType: "application/json;charset=UTF-8",
                            success: function (data) {
                                if (!data.code) {
                                    bsAlert("题目编辑成功！");
                                    vm.showProblemListPage();
                                }
                                else {
                                    bsAlert(data.data);
                                }
                            }

                        });
                        return false;
                    }
                });
            if (avalon.vmodels.editProblem) {
                var vm = avalon.vmodels.editProblem;
            }
            else {
                var vm = avalon.define({
                    $id: "editProblem",
                    title: "",
                    timeLimit: -1,
                    memoryLimit: -1,
                    samples: [],
                    tagList:[],
                    ptag: "",
                    visible: true,
                    difficulty: "1",
                    inputDescription: "",
                    outputDescription: "",
                    testCaseIdd: "",
                    uploadSuccess: false,
                    source: "",
                    testCaseList: [],
                    uploadProgress: 0,

                    problemDescriptionEditor: {
                        editorId: "problem-description-editor",
                        placeholder: "题目描述"
                    },
                    problemHintEditor: {
                        editorId: "problem-hint-editor",
                        placeholder: "提示"
                    },

                    addSample: function () {
                        vm.samples.push({input: "", output: "", "visible": true});
                    },
                    delSample: function (sample) {
                        if (confirm("你确定要删除么?")) {
                            vm.samples.remove(sample);
                        }
                    },
                    toggleSample: function (sample) {
                        sample.visible = !sample.visible;
                    },
                    getBtnContent: function (item) {
                        if (item.visible)
                            return "折叠";
                        return "展开";
                    },
                    showProblemListPage: function () {
                        avalon.vmodels.admin.template_url = "template/problem/problem_list.html";
                    },
                    onSelect: function (item) {
                        var ptag = ($(item).val().split("."))[0];
                        getChildrenTagByPid(ptag);

                    },
                    onLoad:function () {
                        console.log("ptag:"+vm.ptag);
                        console.log("loadView");
                    }
                });
            }

            //tag数据
            var tagData = [];
            var initTag = [];

            function getChildrenTagByPid(pid) {
                var childrenTag = [];
                vm.ptag = pid;
                ptagid = pid ;
                for(var i = 0 ; i < tagData.length; i++){
                    if(tagData[i].pid == pid){
                        childrenTag.push(tagData[i].name);
                    }
                }
                $("#tags").tagEditor({
                    initialTags: initTag,
                    autocomplete: {
                        delay: 0, // show suggestions immediately
                        position: {collision: 'flip'}, // automatic menu position up/down
                        source: childrenTag
                    }
                 });
                //移除多余tag-editor节点 最新的节点为0 所以不删除0节点
                var tags = $(".tag-editor");
                if(tags.length >1){
                    for(var i=1;i<tags.length;i++){
                        $(tags[i]).remove();
                    }
                }
            }


            $.ajax({
                url: "/api/admin/problem/?problem_id=" + avalon.vmodels.admin.problemId,
                method: "get",
                dataType: "json",
                success: function (data) {
                    if (data.code) {
                        bsAlert(data.data);
                    }
                    else {
                        var problem = data.data;
                        vm.title = problem.title;
                        avalon.vmodels.problemDescriptionEditor.content = problem.description;
                        vm.timeLimit = problem.time_limit;
                        vm.memoryLimit = problem.memory_limit;
                        vm.samples = [];
                        var problemTags = problem.tags;
                        for (var j = 0; j < problem.tags.length; j++) {
                            initTag.push(problemTags[j].name);
                        }
                        for (var i = 0; i < problem.samples.length; i++) {
                            vm.samples.push({
                                input: problem.samples[i].input,
                                output: problem.samples[i].output,
                                visible: false
                            })
                        }
                        avalon.vmodels.problemHintEditor.content = problem.hint;
                        vm.visible = problem.visible;
                        vm.difficulty = problem.difficulty;
                        vm.inputDescription = problem.input_description;
                        vm.outputDescription = problem.output_description;
                        avalon.vmodels.testCaseUploader.setTestCase(problem.test_case_id);
                        var spjVM = avalon.vmodels.spjConfig;
                        spjVM.spj = problem.spj;
                        // spjLanguage可能是null
                        spjVM.spjLanguage = problem.spj_language=="2"?"2":"1";
                        spjVM.spjCode = problem.spj_code;

                        vm.source = problem.source;
                        $.ajax({
                            beforeSend: csrfTokenHeader,
                            url: "/api/admin/tag/",
                            dataType: "json",
                            method: "get",
                            success: function (data) {
                                if (!data.code) {
                                    tagData = data.data;
                                    if(vm.tagList.length == 0){
                                        for (var i = 0; i < data.data.length; i++) {
                                            if(data.data[i].tag_type === 1){
                                                vm.tagList.push(data.data[i]);
                                            }
                                        }
                                    }
                                    var ptagid;
                                    if(problemTags.length === 0){
                                        ptagid = vm.tagList[0].id;
                                    }else{
                                        ptagid = problemTags[0].pid;
                                    }
                                    getChildrenTagByPid(ptagid);
                                    for(var j=0;j<vm.tagList.length;j++){
                                        if(vm.tagList[j].id === ptagid)
                                            vm.ptag = vm.tagList[j];
                                    }
                                    vm.tagList.remove(vm.ptag);
                                }
                                else {
                                    bsAlert(data.data);
                                }
                            }
                        });
                    }
                }
            });
        });
        avalon.scan();

    });