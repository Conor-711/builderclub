import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TestSupabase = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const tests = [
    {
      name: "1. 测试连接配置",
      test: async () => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        return {
          url: url || "❌ 未配置",
          key: key ? "✅ 已配置 (" + key.substring(0, 20) + "...)" : "❌ 未配置",
        };
      },
    },
    {
      name: "2. 测试 users 表读取",
      test: async () => {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .limit(1);
        return { data, error: error?.message || null };
      },
    },
    {
      name: "3. 测试 users 表写入",
      test: async () => {
        const testId = crypto.randomUUID();
        const { data, error } = await supabase.from("users").insert({
          id: testId,
          first_name: "Test",
          last_name: "User",
          city: "Test City",
          intro: "Test intro",
          avatar_url: "",
          twitter_url: "",
          linkedin_url: "",
        });
        
        // 清理测试数据
        if (!error) {
          await supabase.from("users").delete().eq("id", testId);
        }
        
        return { success: !error, error: error?.message || null };
      },
    },
    {
      name: "4. 检查 RLS 状态",
      test: async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .limit(1);
          
          if (error && error.code === "42501") {
            return { rls: "❌ RLS 启用且阻止访问", needFix: true };
          }
          return { rls: "✅ RLS 已禁用或配置正确", needFix: false };
        } catch (e: any) {
          return { rls: "❌ " + e.message, needFix: true };
        }
      },
    },
  ];

  const runTest = async (testFn: () => Promise<any>, name: string) => {
    setLoading(true);
    try {
      const result = await testFn();
      setResult({ name, success: true, result });
    } catch (error: any) {
      setResult({ name, success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({ name: test.name, success: true, result });
      } catch (error: any) {
        results.push({ name: test.name, success: false, error: error.message });
      }
    }
    setResult(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4">Supabase 连接测试</h1>
          <p className="text-muted-foreground mb-6">
            使用此页面诊断 Supabase 连接问题
          </p>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <Button
                key={index}
                onClick={() => runTest(test.test, test.name)}
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
              >
                {test.name}
              </Button>
            ))}
            <Button
              onClick={runAllTests}
              className="w-full"
              disabled={loading}
            >
              {loading ? "测试中..." : "运行所有测试"}
            </Button>
          </div>
        </Card>

        {result && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">测试结果</h2>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="font-bold mb-2">⚠️ 如果测试失败</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>打开 <code>SUPABASE_FIX.md</code> 文件查看详细修复步骤</li>
            <li>在 Supabase SQL Editor 执行 <code>supabase-schema-dev.sql</code></li>
            <li>确保禁用了 RLS（Row Level Security）</li>
            <li>重启开发服务器</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default TestSupabase;
