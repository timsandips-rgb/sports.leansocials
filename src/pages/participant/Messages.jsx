import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { messageService } from '../../services/messageService';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatTimeAgo } from '../../utils/formatters';

export default function Messages() {
  const { user, community } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');

  useEffect(() => {
    if (!community?.id) return;
    const unsub = messageService.subscribe(community.id, (data) => {
      setMessages(data.slice(0, 100));
      setLoading(false);
    });
    return () => unsub();
  }, [community?.id]);

  const send = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await messageService.send({
        communityId: community.id, senderId: user.userId, senderName: user.fullName,
        recipientId: 'all', type, content: content.trim(),
      });
      setContent('');
      toast.success('Message sent');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Community Messages</h1>
      <Card>
        <form onSubmit={send} className="space-y-3">
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} className="max-w-xs">
            <option value="general">General</option>
            <option value="congratulations">Congratulations</option>
          </Select>
          <Textarea label="Message" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message to the community..." />
          <div className="flex justify-end"><Button type="submit">💬 Send</Button></div>
        </form>
      </Card>
      {messages.length === 0 ? (
        <Card><EmptyState icon="💬" title="No messages yet" description="Be the first to start a conversation" /></Card>
      ) : (
        <Card>
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="p-3 border-b border-surface last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{m.senderName} <span className="text-text-secondary font-normal">• @{m.senderName.toLowerCase().replace(/\s/g, '.')}</span></p>
                    <p className="mt-1">{m.content}</p>
                  </div>
                  <span className="text-xs text-text-secondary">{formatTimeAgo(m.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
