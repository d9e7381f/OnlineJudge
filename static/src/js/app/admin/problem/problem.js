require(["jquery", "avalon", "csrfToken", "bsAlert", "pager"], function ($, avalon, csrfTokenHeader, bsAlert) {


    avalon.ready(function () {
        if(avalon.vmodels.problemList){
            vm = avalon.vmodels.problemList;
        }
        else {
            var vm = avalon.define({
                $id: "problemList",
                problemList: [],
                keyword: "",
                showVisibleOnly: false,

                pager: {
                    getPage: function (page) {
                        getPage(page);
                    }
                },

                showEditProblemPage: function (problemId) {
                    avalon.vmodels.admin.problemId = problemId;
                    avalon.vmodels.admin.template_url = "template/problem/edit_problem.html";
                },
                showProblemSubmissionPage: function(problemId){
                    avalon.vmodels.admin.problemId = problemId;
                    avalon.vmodels.admin.template_url = "template/problem/submission_list.html";
                },
                deleteProblemById: function (problemId) {
                    avalon.vmodels.admin.problemId = problemId;
                    avalon.vmodels.admin.template_url = deleteAjax(problemId);
                },

                search: function(){
                    getPage(1);
                    avalon.vmodels.problemPager.currentPage = 1;
                }
            });
            vm.$watch("showVisibleOnly", function () {
                getPage(1);
                avalon.vmodels.problemPager.currentPage = 1;
            });
        }

        function getPage(page) {
            var url = "/api/admin/problem/?paging=true&page=" + page + "&page_size=10";
            if (vm.keyword != "")
                url += "&keyword=" + vm.keyword;
            if (vm.showVisibleOnly)
                url += "&visible=true";

            $.ajax({
                url: url,
                dataType: "json",
                method: "get",
                success: function (data) {
                    if (!data.code) {
                        vm.problemList = data.data.results;
                        avalon.vmodels.problemPager.totalPage = data.data.total_page;
                    }
                    else {
                        bsAlert(data.data);
                    }
                }
            });
        }
        function deleteAjax(problem_id) {
            // 获取所要删除问题的id
            if(confirm("确定删除该题目")){
                $.ajax({
                    url: "/problem/delete/?problem_id="+problem_id,
                    method: "delete",
                    dataType: "json",
                    success: function (data) {
                        if(!data.code){
                            bsAlert("题目删除成功");
                            //删除成功后刷新页面 重新请求题目列表
                            window.location.reload();
                        }
                    },
                    error: function (data) {
                        bsAlert("请求失败");
                    }
                });
            }

        }
    });

    avalon.scan();

});

