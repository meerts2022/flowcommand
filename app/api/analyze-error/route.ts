import { NextRequest, NextResponse } from 'next/server';
import { N8nClient } from '@/lib/n8n-client';
import { getStoredInstances } from '@/lib/storage';
import { getCachedAnalysis, saveCachedAnalysis } from '@/lib/analysis-cache';

export async function POST(request: NextRequest) {
    try {
        const { instanceId, executionId, forceRefresh } = await request.json();

        if (!instanceId || !executionId) {
            return NextResponse.json(
                { error: 'Missing instanceId or executionId' },
                { status: 400 }
            );
        }

        // Get instance
        const instances = await getStoredInstances();
        const instance = instances.find(i => i.id === instanceId);

        if (!instance) {
            return NextResponse.json(
                { error: 'Instance not found' },
                { status: 404 }
            );
        }

        // Check cache first (unless force refresh requested)
        if (!forceRefresh) {
            const cachedAnalysis = getCachedAnalysis(executionId);
            if (cachedAnalysis) {
                console.log(`[CACHE HIT] Returning cached analysis for execution ${executionId}`);
                return NextResponse.json({
                    analysis: cachedAnalysis,
                    cached: true,
                    timestamp: new Date().toISOString()
                });
            }
        }

        console.log(`[CACHE MISS] Fetching fresh analysis for execution ${executionId}`);

        // Fetch execution details
        let execution;
        let workflows;
        let workflow;

        try {
            console.log('[API] Creating N8nClient for instance:', instanceId);
            const client = new N8nClient(instance);

            console.log('[API] Fetching execution detail for:', executionId);
            execution = await client.getExecutionDetail(executionId);
            console.log('[API] Execution fetched successfully:', {
                id: execution.id,
                status: execution.status,
                hasData: !!execution.data
            });

            console.log('[API] Fetching workflows...');
            workflows = await client.getAllWorkflows();
            console.log('[API] Workflows fetched:', workflows.length);

            workflow = workflows.find(w => w.id === execution.workflowId);
            console.log('[API] Workflow found:', workflow?.name || 'UNKNOWN');
        } catch (error) {
            console.error('[API ERROR] Failed to fetch execution data:', error);
            return NextResponse.json(
                { error: `Failed to fetch execution data: ${error instanceof Error ? error.message : 'Unknown error'}` },
                { status: 500 }
            );
        }

        // Extract error information
        const errorData = execution.data?.resultData?.error;
        const runData = execution.data?.resultData?.runData;
        const lastNodeExecuted = execution.data?.resultData?.lastNodeExecuted;

        // Find failed node
        let failedNode: string | null = null;
        let nodeError: any = null;

        if (runData) {
            for (const [nodeName, nodeExecutions] of Object.entries(runData)) {
                if (nodeExecutions[0]?.error) {
                    failedNode = nodeName;
                    nodeError = nodeExecutions[0].error;
                    break;
                }
            }
        }

        const displayError = nodeError || errorData;
        console.log('[API] Error data extracted:', {
            hasErrorData: !!errorData,
            hasRunData: !!runData,
            failedNode,
            hasNodeError: !!nodeError,
            hasDisplayError: !!displayError
        });

        // Prepare prompt for AI - IN DUTCH for better readability
        const prompt = `Je bent een expert n8n workflow debugger. Analyseer deze workflow execution error en geef een gedetailleerde analyse IN HET NEDERLANDS.

Workflow: ${workflow?.name || 'Onbekend'}
Execution ID: ${execution.id}
Gestart: ${execution.startedAt}
Status: ${execution.status}
${failedNode ? `Mislukte Node: ${failedNode}` : ''}
${lastNodeExecuted ? `Laatst Uitgevoerde Node: ${lastNodeExecuted}` : ''}

Foutinformatie:
${displayError ? JSON.stringify(displayError, null, 2) : 'Geen specifieke foutinformatie beschikbaar'}

Geef alsjeblieft IN HET NEDERLANDS:
1. **Hoofdoorzaak**: Wat veroorzaakte deze fout?
2. **Uitleg**: Waarom gebeurde dit in de context van n8n workflows?
3. **Hoe Op Te Lossen**: Stap-voor-stap instructies om dit probleem op te lossen
4. **Preventie**: Best practices om deze fout in de toekomst te voorkomen
5. **Extra Tips**: Andere relevante inzichten

Formateer je antwoord in duidelijke secties met markdown-style headers. BELANGRIJK: Schrijf ALLES in het Nederlands.`;

        // Call Google Gemini API (you can also use OpenAI or other providers)
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            return NextResponse.json(
                { error: 'AI service not configured (GEMINI_API_KEY missing)' },
                { status: 500 }
            );
        }

        // Using Gemini 3 Pro Preview - NEWEST model (Nov 2025) with cutting-edge reasoning
        // Most intelligent AI model from Google with 1M token context window
        const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        console.log('[GEMINI] API call made, status:', aiResponse.status);

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error('[GEMINI ERROR] Status:', aiResponse.status);
            console.error('[GEMINI ERROR] Response:', errorText);
            console.error('[GEMINI ERROR] API Key present:', !!geminiApiKey);
            console.error('[GEMINI ERROR] API Key length:', geminiApiKey?.length || 0);
            return NextResponse.json(
                { error: `AI analysis failed: ${aiResponse.status} - ${errorText.substring(0, 200)}` },
                { status: 500 }
            );
        }

        const aiData = await aiResponse.json();
        const analysis = aiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated';

        // Save to cache for future use
        saveCachedAnalysis(instanceId, executionId, analysis, displayError?.message);

        return NextResponse.json({
            analysis,
            cached: false,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error analyzing execution:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
