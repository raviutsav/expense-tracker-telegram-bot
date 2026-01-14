import React, { useState } from 'react';
import Layout from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { MessageCircle, ExternalLink, Command, ShieldCheck, Zap, Mail, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = window.location.origin;

const BotGuide = ({ onNavigate, isAuthenticated }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        const formData = new FormData(e.target);
        const feature = formData.get('feature');
        const username = formData.get('username');

        if (!feature) {
            setIsSubmitting(false);
            return;
        }

        try {
            await axios.post(`${API_BASE}/api/feature-request`, {
                text: feature,
                username: username
            });
            setSubmitStatus('success');
            e.target.reset();
            // Clear success message after 3 seconds
            setTimeout(() => setSubmitStatus(null), 3000);
        } catch (error) {
            console.error('Error submitting feature request:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout currentPage="Telegram Bot" onNavigate={onNavigate} isAuthenticated={isAuthenticated}>
            <div className="space-y-6">
                {/* Hero Section */}
                <Card className="border-border bg-card shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageCircle className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2 max-w-2xl">
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                    Your Personal Expense Assistant
                                </h2>
                                <p className="text-muted-foreground">
                                    Connect with our Telegram bot to track expenses, manage budgets, and get instant insights - all from your chat app.
                                </p>
                            </div>
                            <div className="pt-2">
                                <Button
                                    size="lg"
                                    className="gap-2"
                                    onClick={() => window.open('https://t.me/AamdaniEathaniKharchaRupaiya_bot', '_blank')}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Open in Telegram
                                    <ExternalLink className="h-4 w-4 ml-1 opacity-50" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Features Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <Zap className="h-8 w-8 text-amber-500 mb-2" />
                            <CardTitle className="text-lg text-foreground">Quick Logging</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80">
                                Just send a message like "/add Spent 500 on lunch" to log expenses instantly. No forms to fill.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <Command className="h-8 w-8 text-indigo-500 mb-2" />
                            <CardTitle className="text-lg text-foreground">Smart Commands</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80">
                                Use commands /view to get instant financial overviews.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
                            <CardTitle className="text-lg text-foreground">Secure Sync</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80">
                                All your chat data automatically syncs with this dashboard in real-time.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">How to Get Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-4 list-decimal list-inside text-sm text-foreground/80">
                            <li className="pl-2">
                                Click the <strong className="text-foreground">Open in Telegram</strong> button above.
                            </li>
                            <li className="pl-2">
                                Tap <strong className="text-foreground">Start</strong> in the Telegram chat to register.
                            </li>
                            <li className="pl-2">
                                Use the <strong className="text-foreground">/add</strong> command to log an expense.
                                <br />
                                <span className="text-sm text-foreground/60 italic">Example: "/add spent 80 on litti choka at DK litti corner"</span>
                            </li>
                            <li className="pl-2">
                                Use <strong className="text-foreground">/view</strong> to get your personal dashboard link.
                            </li>
                            <li className="pl-2">
                                Open the link to see your transactions appear instantly!
                            </li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Feature Request Form */}
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                        <Mail className="h-8 w-8 text-blue-500 mb-2" />
                        <CardTitle className="text-foreground">Request a Feature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Feature Description <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    name="feature"
                                    placeholder="Describe the feature you'd like to see..."
                                    required
                                    className="min-h-[100px]"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Your Username (Optional)
                                </label>
                                <Input
                                    name="username"
                                    placeholder="@username"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Request'
                                    )}
                                </Button>
                                {submitStatus === 'success' && (
                                    <div className="flex items-center text-green-600 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                        Request sent successfully!
                                    </div>
                                )}
                                {submitStatus === 'error' && (
                                    <div className="text-red-500 text-sm font-medium animate-in fade-in">
                                        Failed to send request. Please try again.
                                    </div>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default BotGuide;
