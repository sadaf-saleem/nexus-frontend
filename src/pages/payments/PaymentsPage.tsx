import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Transaction, Wallet } from '../../types';
import { Wallet as WalletIcon, ArrowUp, ArrowDown, ArrowRightLeft, TrendingUp, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock storage
const wallets: Map<string, Wallet> = new Map();
const transactions: Transaction[] = [];

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      // Initialize wallet if doesn't exist
      if (!wallets.has(user.id)) {
        wallets.set(user.id, {
          userId: user.id,
          balance: 10000, // Starting balance
          currency: 'USD'
        });
      }
      setWallet(wallets.get(user.id) || null);

      // Load transactions
      const userTrans = transactions.filter(
        t => t.senderId === user.id || t.receiverId === user.id
      );
      setUserTransactions(userTrans.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  }, [user]);

  const handleDeposit = () => {
    if (!user || !wallet || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const depositAmount = parseFloat(amount);
    wallet.balance += depositAmount;
    wallets.set(user.id, wallet);
    setWallet({ ...wallet });

    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'deposit',
      amount: depositAmount,
      senderId: user.id,
      status: 'completed',
      description: description || 'Deposit',
      createdAt: new Date().toISOString()
    };

    transactions.push(transaction);
    setUserTransactions([transaction, ...userTransactions]);
    setShowDepositModal(false);
    setAmount('');
    setDescription('');
    toast.success('Deposit successful!');
  };

  const handleWithdraw = () => {
    if (!user || !wallet || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    wallet.balance -= withdrawAmount;
    wallets.set(user.id, wallet);
    setWallet({ ...wallet });

    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'withdraw',
      amount: withdrawAmount,
      senderId: user.id,
      status: 'completed',
      description: description || 'Withdrawal',
      createdAt: new Date().toISOString()
    };

    transactions.push(transaction);
    setUserTransactions([transaction, ...userTransactions]);
    setShowWithdrawModal(false);
    setAmount('');
    setDescription('');
    toast.success('Withdrawal successful!');
  };

  const handleTransfer = () => {
    if (!user || !wallet || !amount || !recipientEmail || parseFloat(amount) <= 0) {
      toast.error('Please fill all fields');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    wallet.balance -= transferAmount;
    wallets.set(user.id, wallet);
    setWallet({ ...wallet });

    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'transfer',
      amount: transferAmount,
      senderId: user.id,
      receiverId: recipientEmail,
      status: 'completed',
      description: description || `Transfer to ${recipientEmail}`,
      createdAt: new Date().toISOString()
    };

    transactions.push(transaction);
    setUserTransactions([transaction, ...userTransactions]);
    setShowTransferModal(false);
    setAmount('');
    setRecipientEmail('');
    setDescription('');
    toast.success('Transfer successful!');
  };

  const handleFunding = () => {
    if (!user || !wallet || !amount || !recipientEmail || parseFloat(amount) <= 0) {
      toast.error('Please fill all fields');
      return;
    }

    const fundingAmount = parseFloat(amount);
    if (fundingAmount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    wallet.balance -= fundingAmount;
    wallets.set(user.id, wallet);
    setWallet({ ...wallet });

    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'funding',
      amount: fundingAmount,
      senderId: user.id,
      receiverId: recipientEmail,
      status: 'completed',
      description: description || `Funding deal: ${recipientEmail}`,
      createdAt: new Date().toISOString()
    };

    transactions.push(transaction);
    setUserTransactions([transaction, ...userTransactions]);
    setShowFundingModal(false);
    setAmount('');
    setRecipientEmail('');
    setDescription('');
    toast.success('Deal funded successfully!');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown size={18} className="text-green-500" />;
      case 'withdraw':
        return <ArrowUp size={18} className="text-red-500" />;
      case 'transfer':
        return <ArrowRightLeft size={18} className="text-blue-500" />;
      case 'funding':
        return <TrendingUp size={18} className="text-purple-500" />;
      default:
        return <DollarSign size={18} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle size={12} />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock size={12} />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="error" className="flex items-center gap-1">
            <XCircle size={12} />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  if (!user || !wallet) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Wallet</h1>
          <p className="text-gray-600">Manage your transactions and funding</p>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Wallet Balance</p>
              <h2 className="text-4xl font-bold">
                ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-primary-100 text-sm mt-2">{wallet.currency}</p>
            </div>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <WalletIcon size={40} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          leftIcon={<ArrowDown size={18} />}
          onClick={() => setShowDepositModal(true)}
          fullWidth
        >
          Deposit
        </Button>
        <Button
          variant="outline"
          leftIcon={<ArrowUp size={18} />}
          onClick={() => setShowWithdrawModal(true)}
          fullWidth
        >
          Withdraw
        </Button>
        <Button
          variant="outline"
          leftIcon={<ArrowRightLeft size={18} />}
          onClick={() => setShowTransferModal(true)}
          fullWidth
        >
          Transfer
        </Button>
        {user.role === 'investor' && (
          <Button
            leftIcon={<TrendingUp size={18} />}
            onClick={() => setShowFundingModal(true)}
            fullWidth
          >
            Fund Deal
          </Button>
        )}
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          {userTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span className="text-sm text-gray-900 capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${
                          tx.type === 'deposit' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{tx.description}</span>
                        {tx.receiverId && (
                          <p className="text-xs text-gray-500">To: {tx.receiverId}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Deposit Modal */}
      {showDepositModal && (
        <Modal
          title="Deposit Funds"
          onClose={() => {
            setShowDepositModal(false);
            setAmount('');
            setDescription('');
          }}
          onSubmit={handleDeposit}
          submitText="Deposit"
        >
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            placeholder="0.00"
          />
          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <Modal
          title="Withdraw Funds"
          onClose={() => {
            setShowWithdrawModal(false);
            setAmount('');
            setDescription('');
          }}
          onSubmit={handleWithdraw}
          submitText="Withdraw"
        >
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            placeholder="0.00"
          />
          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
        </Modal>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <Modal
          title="Transfer Funds"
          onClose={() => {
            setShowTransferModal(false);
            setAmount('');
            setRecipientEmail('');
            setDescription('');
          }}
          onSubmit={handleTransfer}
          submitText="Transfer"
        >
          <Input
            label="Recipient Email"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            fullWidth
            placeholder="user@example.com"
          />
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            placeholder="0.00"
          />
          <Input
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
        </Modal>
      )}

      {/* Funding Modal */}
      {showFundingModal && (
        <Modal
          title="Fund Deal"
          onClose={() => {
            setShowFundingModal(false);
            setAmount('');
            setRecipientEmail('');
            setDescription('');
          }}
          onSubmit={handleFunding}
          submitText="Fund Deal"
        >
          <Input
            label="Entrepreneur Email"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            fullWidth
            placeholder="entrepreneur@example.com"
          />
          <Input
            label="Funding Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            placeholder="0.00"
          />
          <Input
            label="Deal Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Describe the deal..."
          />
        </Modal>
      )}
    </div>
  );
};

// Modal Component
const Modal: React.FC<{
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitText: string;
}> = ({ title, children, onClose, onSubmit, submitText }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="space-y-4">
          {children}
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button fullWidth onClick={onSubmit}>
              {submitText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

