export type OperationKind = 'income' | 'expense' | 'transfer' | 'goal_transfer'
export type OperationStatus = 'actual' | 'planned' | 'expected'
export type AccountType = 'card' | 'cash' | 'deposit' | 'property' | 'investment'
export type EnvelopeKind = 'required' | 'reserve' | 'debt' | 'living' | 'flexible'
export interface Account { id:string; name:string; type:AccountType; balanceKopecks:number; available:boolean }
export interface Category { id:string; name:string; limitKopecks:number; suggestedPercent:number; archived?:boolean }
export interface Operation { id:string; kind:OperationKind; status:OperationStatus; amountKopecks:number; date:string; title:string; accountId?:string; toAccountId?:string; categoryId?:string; envelopeId?:string; goalId?:string; required?:boolean; comment?:string }
export interface Goal { id:string; name:string; targetKopecks:number; balanceKopecks:number; monthlyKopecks?:number; deadline?:string; primary?:boolean; basePercent?:number }
export interface Obligation { id:string; name:string; amountKopecks:number; dueDate:string; categoryId?:string; paid:boolean; kind:'bill'|'loan'; debtType?:'bank'|'person' }
export interface Loan { id:string; name:string; balanceKopecks:number; annualRatePercent:number; paymentKopecks:number; dueDay:number; endDate?:string; accountId?:string }
export interface Envelope { id:string; kind:EnvelopeKind; name:string; balanceKopecks:number }
export interface PayPeriod { id:string; startsOn:string; nextIncomeOn:string; incomeKopecks?:number }
