// Universal Agent Wallet Playground JavaScript

class PlaygroundAPI {
    constructor() {
        this.baseUrl = window.location.origin;
    }

    async generateKeys() {
        const response = await fetch(`${this.baseUrl}/playground/generate-keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }

    async checkBalances() {
        const response = await fetch(`${this.baseUrl}/playground/balances`);
        return await response.json();
    }


    async restartBackend() {
        const response = await fetch(`${this.baseUrl}/playground/restart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }

    async runX402Demo(question) {
        const response = await fetch(`${this.baseUrl}/playground/x402-ai-demo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });
        return response.json();
    }

    async summarizeWebsite(url) {
        // First request - should get 402 Payment Required
        let response = await fetch(`${this.baseUrl}/x402/summarize-website`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (response.status === 402) {
            const paymentInfo = await response.json();
            
            // Create real payment transaction using UniversalWallet
            const paymentResponse = await fetch(`${this.baseUrl}/playground/make-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: paymentInfo.payment.receiverAddress,
                    amount: '0.001', // 0.001 AVAX
                    description: 'Website Summarization Service'
                })
            });

            const paymentResult = await paymentResponse.json();
            
            if (paymentResult.error) {
                throw new Error(`Payment failed: ${paymentResult.message}`);
            }

            // Retry request with real payment transaction
            response = await fetch(`${this.baseUrl}/x402/summarize-website`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-payment': JSON.stringify({
                        txHash: paymentResult.txHash,
                        from: paymentResult.from,
                        to: paymentResult.to,
                        value: paymentResult.amount,
                        timestamp: paymentResult.timestamp,
                        network: 'avalanche-fuji'
                    })
                },
                body: JSON.stringify({ url })
            });
        }

        return response.json();
    }
}

class PlaygroundUI {
    constructor() {
        this.api = new PlaygroundAPI();
        this.initializeEventListeners();
        this.loadSavedWallets();
    }

    initializeEventListeners() {
        // Generate Keys button
        document.getElementById('generateKeysBtn').addEventListener('click', () => {
            this.handleGenerateKeys();
        });

        // Check Balances button
        document.getElementById('checkBalancesBtn').addEventListener('click', () => {
            this.handleCheckBalances();
        });


        // Run x402 AI Demo button
        document.getElementById('runX402DemoBtn').addEventListener('click', () => {
            this.handleRunX402Demo();
        });

        // Website Summarizer button
        document.getElementById('runSummarizerBtn').addEventListener('click', () => {
            this.handleRunSummarizer();
        });

        // Attach button listeners for restart and mark saved
        this.attachButtonListeners();
    }

    attachButtonListeners() {
        // Restart Backend button
        const restartBtn = document.getElementById('restartBackendBtn');
        if (restartBtn) {
            restartBtn.removeEventListener('click', this.handleRestartBackend);
            restartBtn.addEventListener('click', () => {
                this.handleRestartBackend();
            });
        }

        // Mark as Saved button
        const markSavedBtn = document.getElementById('markSavedBtn');
        if (markSavedBtn) {
            markSavedBtn.removeEventListener('click', this.markKeysAsSaved);
            markSavedBtn.addEventListener('click', () => {
                this.markKeysAsSaved();
            });
        }
    }

    async handleGenerateKeys() {
        const button = document.getElementById('generateKeysBtn');
        const resultDiv = document.getElementById('keysResult');
        
        try {
            this.setButtonLoading(button, true);
            this.hideStatus();
            
            const result = await this.api.generateKeys();
            
            if (result.error) {
                this.showStatus('error', 'Key Generation Failed', result.message || result.error);
                return;
            }

            // Save wallet info to localStorage
            const walletData = {
                agentA: {
                    address: result.agentA.address,
                    privateKey: result.agentA.privateKey
                },
                agentB: {
                    address: result.agentB.address,
                    privateKey: result.agentB.privateKey
                },
                timestamp: new Date().toISOString(),
                envSaved: false
            };
            localStorage.setItem('playgroundWallets', JSON.stringify(walletData));

            // Populate the UI with generated keys
            this.displayWalletInfo(walletData);

            resultDiv.style.display = 'block';
            this.showStatus('success', 'Keys Generated Successfully', 
                'Agent wallets created! Copy the private keys to your .env file and restart backend.');

        } catch (error) {
            console.error('Key generation failed:', error);
            this.showStatus('error', 'Network Error', 
                'Failed to generate keys. Check that the backend is running.');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    async handleCheckBalances() {
        const button = document.getElementById('checkBalancesBtn');
        const resultDiv = document.getElementById('balancesResult');
        
        try {
            this.setButtonLoading(button, true);
            this.hideStatus();
            
            const result = await this.api.checkBalances();
            
            if (result.error) {
                this.showStatus('error', 'Balance Check Failed', result.message || result.error);
                if (result.instructions) {
                    const instructions = result.instructions.join('\n');
                    this.showStatus('info', 'Instructions', instructions);
                }
                return;
            }

            // Populate balance information
            document.getElementById('agentABalanceAddress').textContent = result.agentA.address;
            document.getElementById('agentABalance').textContent = this.formatBalance(result.agentA.balanceAvax);
            document.getElementById('agentBBalanceAddress').textContent = result.agentB.address;
            document.getElementById('agentBBalance').textContent = this.formatBalance(result.agentB.balanceAvax);

            resultDiv.style.display = 'block';
            
            // Check if Agent A has sufficient balance
            const agentABalance = parseFloat(result.agentA.balanceAvax);
            if (agentABalance < 0.002) {
                this.showStatus('warning', 'Low Balance Warning', 
                    `Agent A has ${this.formatBalance(result.agentA.balanceAvax)} but needs at least 0.002 AVAX for the demo. Fund Agent A from the Fuji faucet.`);
            } else {
                this.showStatus('success', 'Balances Retrieved', 
                    'Agent balances loaded successfully. Agent A has sufficient funds for the demo.');
            }

        } catch (error) {
            console.error('Balance check failed:', error);
            this.showStatus('error', 'Network Error', 
                'Failed to check balances. Check that the backend is running.');
        } finally {
            this.setButtonLoading(button, false);
        }
    }


    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            button.originalText = button.textContent;
            button.textContent = button.textContent.replace(' ⏳', '') + ' ⏳';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (button.originalText) {
                button.textContent = button.originalText;
            }
        }
    }

    showStatus(type, title, message) {
        const statusSection = document.getElementById('statusSection');
        const statusTitle = document.getElementById('statusTitle');
        const statusContent = document.getElementById('statusContent');
        
        // Remove existing type classes
        statusSection.classList.remove('success', 'warning', 'info');
        
        // Add new type class
        if (type !== 'error') {
            statusSection.classList.add(type);
        }
        
        statusTitle.textContent = title;
        statusContent.textContent = message;
        statusSection.style.display = 'block';
        
        // Scroll to status section
        statusSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideStatus() {
        const statusSection = document.getElementById('statusSection');
        statusSection.style.display = 'none';
    }

    async handleRestartBackend() {
        const button = document.getElementById('restartBackendBtn');
        
        try {
            this.setButtonLoading(button, true);
            this.hideStatus();
            
            const result = await this.api.restartBackend();
            
            if (result.error) {
                this.showStatus('error', 'Restart Failed', result.message || result.error);
                return;
            }

            // Show manual restart instructions
            const instructions = result.instructions.join('\n');
            const commands = result.commands.join('\n');
            
            this.showStatus('info', 'Manual Restart Required', 
                `${result.message}\n\nSteps:\n${instructions}\n\nCommands to run:\n${commands}\n\n${result.note}`);

        } catch (error) {
            console.error('Backend restart failed:', error);
            this.showStatus('error', 'Network Error', 
                'Failed to get restart instructions. Check that the backend is running.');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    async waitForBackendRestart() {
        let attempts = 0;
        const maxAttempts = 20; // 20 seconds max
        
        const checkBackend = async () => {
            try {
                const response = await fetch(`${this.api.baseUrl}/playground/health`);
                if (response.ok) {
                    // Mark keys as saved since backend restart means .env was updated
                    this.markKeysAsSaved();
                    
                    this.showStatus('success', 'Backend Restarted!', 
                        'Backend is back online. Keys are now loaded from .env file.');
                    return true;
                }
            } catch (error) {
                // Backend still restarting
            }
            return false;
        };

        const pollBackend = async () => {
            attempts++;
            const isOnline = await checkBackend();
            
            if (isOnline) {
                return;
            }
            
            if (attempts >= maxAttempts) {
                this.showStatus('warning', 'Restart Taking Long', 
                    'Backend restart is taking longer than expected. Try refreshing manually.');
                return;
            }

            this.showStatus('info', `Waiting for Backend (${attempts}s)`, 
                'Checking if backend is back online...');
            
            setTimeout(pollBackend, 1000);
        };

        // Start polling after 2 seconds
        setTimeout(pollBackend, 2000);
    }

    loadSavedWallets() {
        const savedWallets = localStorage.getItem('playgroundWallets');
        if (savedWallets) {
            try {
                const walletData = JSON.parse(savedWallets);
                this.displayWalletInfo(walletData);
                document.getElementById('keysResult').style.display = 'block';
                
                if (walletData.envSaved) {
                    this.showStatus('info', 'Wallets Loaded', 
                        'Previously generated wallets loaded. Keys are already in .env file.');
                } else {
                    this.showStatus('warning', 'Wallets Loaded', 
                        'Previously generated wallets loaded. Remember to copy keys to .env file and restart backend.');
                }
            } catch (error) {
                console.error('Failed to load saved wallets:', error);
            }
        }
    }

    displayWalletInfo(walletData) {
        // Always show addresses
        document.getElementById('agentAAddress').value = walletData.agentA.address;
        document.getElementById('agentBAddress').value = walletData.agentB.address;

        // Show or hide private keys based on envSaved status
        if (walletData.envSaved) {
            // Hide private keys if already saved to .env
            document.getElementById('agentAPrivateKey').value = '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••';
            document.getElementById('agentBPrivateKey').value = '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••';
            document.getElementById('agentAPrivateKey').style.color = '#999';
            document.getElementById('agentBPrivateKey').style.color = '#999';
            
            // Update instructions
            const instructions = document.querySelector('.instructions');
            if (instructions) {
                instructions.innerHTML = `
                    <h4>✅ Keys Already Saved</h4>
                    <p>Private keys are safely stored in your .env file. You can now:</p>
                    <ol>
                        <li>Fund Agent A with Fuji AVAX from: <a href="https://faucet.avax.network/" target="_blank">https://faucet.avax.network/</a></li>
                        <li>Check balances and run payments</li>
                        <li>Generate new keys if needed</li>
                    </ol>
                    <div style="margin-top: 12px;">
                        <button id="restartBackendBtn" class="btn btn-warning">📋 Show Restart Instructions</button>
                        <button id="markSavedBtn" class="btn btn-secondary" style="margin-left: 8px;">✅ Mark as Saved</button>
                    </div>
                `;
                
                // Re-attach event listeners after updating innerHTML
                this.attachButtonListeners();
            }
        } else {
            // Show private keys if not yet saved
            document.getElementById('agentAPrivateKey').value = walletData.agentA.privateKey;
            document.getElementById('agentBPrivateKey').value = walletData.agentB.privateKey;
            document.getElementById('agentAPrivateKey').style.color = '';
            document.getElementById('agentBPrivateKey').style.color = '';

            // Create .env content
            const envContent = `AGENT_A_PRIVATE_KEY=${walletData.agentA.privateKey}\nAGENT_B_PRIVATE_KEY=${walletData.agentB.privateKey}`;
            document.getElementById('envContent').textContent = envContent;
        }
    }

    markKeysAsSaved() {
        const savedWallets = localStorage.getItem('playgroundWallets');
        if (savedWallets) {
            try {
                const walletData = JSON.parse(savedWallets);
                walletData.envSaved = true;
                localStorage.setItem('playgroundWallets', JSON.stringify(walletData));
                this.displayWalletInfo(walletData);
                this.showStatus('success', 'Keys Marked as Saved', 
                    'Private keys are now hidden for security. Addresses remain visible.');
            } catch (error) {
                console.error('Failed to mark keys as saved:', error);
            }
        }
    }

    async handleRunX402Demo() {
        const button = document.getElementById('runX402DemoBtn');
        const resultDiv = document.getElementById('x402Result');
        
        try {
            this.setButtonLoading(button, true);
            this.hideStatus();
            
            // Capture balances before the demo
            const balancesBefore = await this.api.checkBalances();
            
            const question = document.getElementById('aiQuestion').value || '¿Qué es la economía de agentes en Avalanche?';
            
            const result = await this.api.runX402Demo(question);
            
            if (result.error) {
                this.showStatus('error', 'x402 Demo Failed', result.message || result.error);
                this.displayX402Logs(result.logs || []);
                return;
            }

            // Capture balances after the demo
            const balancesAfter = await this.api.checkBalances();

            // Display results with balance comparison
            this.displayX402Results(result, balancesBefore, balancesAfter);
            resultDiv.style.display = 'block';
            
            // Auto-refresh the main balances section
            this.refreshMainBalances(balancesAfter);
            
            this.showStatus('success', 'x402 AI Demo Completed', 
                'AI answer received successfully via x402 payment! Balances have been updated.');

        } catch (error) {
            console.error('x402 demo failed:', error);
            this.showStatus('error', 'Network Error', 
                'Failed to run x402 demo. Check that the backend is running.');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    displayX402Results(result, balancesBefore, balancesAfter) {
        // Display question and answer
        document.getElementById('x402Question').textContent = result.question;
        document.getElementById('x402Answer').textContent = result.answer;

        // Display balance comparison
        if (balancesBefore && balancesAfter) {
            this.displayBalanceComparison(balancesBefore, balancesAfter);
        }

        // Display payment details
        if (result.payment) {
            document.getElementById('x402PaymentAmount').textContent = `${result.payment.amountAvax} AVAX`;
            document.getElementById('x402TxHash').textContent = result.payment.txHash;
            
            const explorerLink = document.getElementById('x402ExplorerLink');
            explorerLink.href = result.payment.explorerUrl;
            explorerLink.style.display = 'inline';
        } else {
            document.getElementById('x402PaymentAmount').textContent = 'No payment required';
            document.getElementById('x402TxHash').textContent = '-';
            document.getElementById('x402ExplorerLink').style.display = 'none';
        }

        // Display logs
        this.displayX402Logs(result.logs || []);
    }

    displayBalanceComparison(balancesBefore, balancesAfter) {
        const agentABefore = parseFloat(balancesBefore.agentA?.balanceAvax || balancesBefore.agentA) || 0;
        const agentAAfter = parseFloat(balancesAfter.agentA?.balanceAvax || balancesAfter.agentA) || 0;
        const agentBBefore = parseFloat(balancesBefore.agentB?.balanceAvax || balancesBefore.agentB) || 0;
        const agentBAfter = parseFloat(balancesAfter.agentB?.balanceAvax || balancesAfter.agentB) || 0;

        const agentADelta = agentAAfter - agentABefore;
        const agentBDelta = agentBAfter - agentBBefore;

        // Display Agent A balances
        document.getElementById('x402AgentABefore').textContent = this.formatBalance(agentABefore.toString());
        document.getElementById('x402AgentAAfter').textContent = this.formatBalance(agentAAfter.toString());
        
        const agentADeltaEl = document.getElementById('x402AgentADelta');
        agentADeltaEl.textContent = (agentADelta >= 0 ? '+' : '') + this.formatBalance(agentADelta.toString());
        agentADeltaEl.className = `delta-col ${agentADelta >= 0 ? 'positive' : 'negative'}`;

        // Display Agent B balances
        document.getElementById('x402AgentBBefore').textContent = this.formatBalance(agentBBefore.toString());
        document.getElementById('x402AgentBAfter').textContent = this.formatBalance(agentBAfter.toString());
        
        const agentBDeltaEl = document.getElementById('x402AgentBDelta');
        agentBDeltaEl.textContent = (agentBDelta >= 0 ? '+' : '') + this.formatBalance(agentBDelta.toString());
        agentBDeltaEl.className = `delta-col ${agentBDelta >= 0 ? 'positive' : 'negative'}`;
    }

    refreshMainBalances(balancesData) {
        // Update the main balances section
        if (balancesData.agentA !== undefined) {
            const agentABalance = balancesData.agentA.balanceAvax || balancesData.agentA;
            document.getElementById('agentABalance').textContent = this.formatBalance(agentABalance);
        }
        if (balancesData.agentB !== undefined) {
            const agentBBalance = balancesData.agentB.balanceAvax || balancesData.agentB;
            document.getElementById('agentBBalance').textContent = this.formatBalance(agentBBalance);
        }
    }

    displayX402Logs(logs) {
        const logsContainer = document.getElementById('x402Logs');
        logsContainer.textContent = logs.join('\n');
    }

    formatBalance(balance) {
        const num = parseFloat(balance);
        if (isNaN(num)) return '0.000000 AVAX';
        return `${num.toFixed(6)} AVAX`;
    }

    async handleRunSummarizer() {
        const button = document.getElementById('runSummarizerBtn');
        const resultDiv = document.getElementById('summarizerResult');
        
        try {
            this.setButtonLoading(button, true);
            this.hideStatus();
            
            const url = document.getElementById('websiteUrl').value || 'https://avalanche.org';
            
            // Log the start
            this.displaySummaryLogs([
                '🚀 Starting website summarization...',
                `📄 Target URL: ${url}`,
                '💸 Initiating x402 payment flow...',
                '🔗 Using REAL Avalanche Fuji payments'
            ]);
            
            const result = await this.api.summarizeWebsite(url);
            
            if (result.error) {
                this.showStatus('error', 'Summarization Failed', result.message || result.error);
                this.displaySummaryLogs([
                    '❌ Summarization failed',
                    `Error: ${result.message || result.error}`
                ]);
                return;
            }

            // Display results
            this.displaySummaryResults(result);
            resultDiv.style.display = 'block';
            
            this.showStatus('success', 'Website Summarized Successfully!', 
                'AI summary generated with x402 payment completed.');

        } catch (error) {
            console.error('Summarizer failed:', error);
            this.showStatus('error', 'Network Error', 
                'Failed to run website summarizer. Check that the backend is running.');
            this.displaySummaryLogs([
                '❌ Network error occurred',
                `Error: ${error.message}`
            ]);
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    displaySummaryResults(result) {
        // Display URL and summary
        document.getElementById('summaryUrl').textContent = result.url;
        document.getElementById('summaryText').textContent = result.summary;

        // Display payment details
        document.getElementById('summaryPaymentAmount').textContent = result.payment.amount;
        document.getElementById('summaryTxHash').textContent = result.payment.txHash;
        
        const explorerLink = document.getElementById('summaryExplorerLink');
        explorerLink.href = result.payment.explorerUrl;
        explorerLink.style.display = 'inline';

        // Display metadata
        document.getElementById('summaryContentLength').textContent = `${result.metadata.contentLength} characters`;
        document.getElementById('summaryModel').textContent = result.metadata.model;
        document.getElementById('summaryTimestamp').textContent = new Date(result.metadata.timestamp).toLocaleString();

        // Display success logs
        this.displaySummaryLogs([
            '✅ Website content fetched successfully',
            `📊 Extracted ${result.metadata.contentLength} characters`,
            '💸 REAL x402 payment completed on Avalanche Fuji',
            `🔗 Transaction: ${result.payment.txHash}`,
            '✅ Payment verified on blockchain',
            '🤖 AI summary generated',
            '🎉 Process completed successfully!'
        ]);
    }

    displaySummaryLogs(logs) {
        const logsContainer = document.getElementById('summaryLogs');
        logsContainer.textContent = logs.join('\n');
    }
}

// Copy to clipboard functionality
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    let textToCopy;
    
    if (element.tagName === 'INPUT') {
        textToCopy = element.value;
    } else if (element.tagName === 'PRE') {
        textToCopy = element.textContent;
    } else {
        textToCopy = element.textContent;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Show temporary feedback
        const originalText = element.nextElementSibling?.textContent;
        if (element.nextElementSibling && element.nextElementSibling.classList.contains('btn-copy')) {
            element.nextElementSibling.textContent = 'Copied!';
            setTimeout(() => {
                element.nextElementSibling.textContent = 'Copy';
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
    });
}

// Initialize the playground when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PlaygroundUI();
    console.log('🎮 Universal Agent Wallet Playground initialized');
});
