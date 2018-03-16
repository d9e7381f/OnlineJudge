# coding=utf-8
import json

from django.http import HttpResponse, HttpResponseRedirect

# url拦截器
class AdminRequiredMiddleware(object):
    def process_request(self, request):
        path = request.path_info
        if path.startswith("/admin/") or path.startswith("/api/admin/"):
            if not(request.user.is_authenticated()):
                if request.is_ajax():
                    return HttpResponse(json.dumps({"code": 1, "data": u"请先登录"}),
                                        content_type="application/json")
                else:
                    return HttpResponseRedirect("/login/")
            # 开放普通用户访问关于问题创建的api
            if (request.user.admin_type == 0
                    and (path.startswith("/admin/")
                    or path.startswith("/api/admin/tag")
                    or path.startswith("/admin/template/problem/")
                    or path.startswith("/api/admin/problem/")
                    or path.startswith("/api/admin/test_case_upload/"))):
                return
            elif request.user.admin_type > 0 :
                return
            if request.is_ajax():
                return HttpResponse(json.dumps({"code": 1, "data": u"无此权限"}),
                                    content_type="application/json")
            else:
                return HttpResponseRedirect("/login/")