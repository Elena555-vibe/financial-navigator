import type { Account, Category, Envelope, Goal, Loan, Obligation, Operation } from './types'
export const rub = (kopecks:number) => new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',minimumFractionDigits:0,maximumFractionDigits:2}).format(kopecks/100)
export const toKopecks = (value:string) => Math.round(Number(value.replace(',','.').replace(/\s/g,''))*100)
export const monthKey = (date = new Date()) => date.toISOString().slice(0,7)
export const isInMonth = (date:string, month=monthKey()) => date.slice(0,7) === month
export function availableMoney(accounts:Account[]) { return accounts.filter(a=>a.available).reduce((n,a)=>n+a.balanceKopecks,0) }
export function totalAssets(accounts:Account[],goals:Goal[]) { return accounts.reduce((n,a)=>n+a.balanceKopecks,0)+goals.reduce((n,g)=>n+g.balanceKopecks,0) }
export function actualIncome(ops:Operation[], month=monthKey()) { return ops.filter(o=>o.kind==='income'&&o.status==='actual'&&isInMonth(o.date,month)).reduce((n,o)=>n+o.amountKopecks,0) }
export function actualExpenses(ops:Operation[], month=monthKey()) { return ops.filter(o=>o.kind==='expense'&&o.status==='actual'&&isInMonth(o.date,month)).reduce((n,o)=>n+o.amountKopecks,0) }
export function plannedOutgoings(ops:Operation[], obligations:Obligation[], month=monthKey()) { const operationSum=ops.filter(o=>o.kind==='expense'&&o.status==='planned'&&isInMonth(o.date,month)).reduce((n,o)=>n+o.amountKopecks,0); const obligationSum=obligations.filter(o=>!o.paid&&isInMonth(o.dueDate,month)).reduce((n,o)=>n+o.amountKopecks,0); return operationSum+obligationSum }
export function expectedIncome(ops:Operation[], month=monthKey()) { return ops.filter(o=>o.kind==='income'&&o.status==='expected'&&isInMonth(o.date,month)).reduce((n,o)=>n+o.amountKopecks,0) }
export function forecast(accounts:Account[], ops:Operation[], obligations:Obligation[], month=monthKey()) { return availableMoney(accounts)+expectedIncome(ops,month)-plannedOutgoings(ops,obligations,month) }
export function netPosition(accounts:Account[], goals:Goal[], loans:Loan[], debtsOwed=0) { return totalAssets(accounts,goals)+debtsOwed-loans.reduce((n,l)=>n+l.balanceKopecks,0) }
export function categorySpent(ops:Operation[], categoryId:string, month=monthKey()) { return ops.filter(o=>o.kind==='expense'&&o.status==='actual'&&o.categoryId===categoryId&&isInMonth(o.date,month)).reduce((n,o)=>n+o.amountKopecks,0) }
export function budgetRows(categories:Category[],ops:Operation[], month=monthKey()) { return categories.filter(c=>!c.archived).map(c=>({category:c,spent:categorySpent(ops,c.id,month),remaining:c.limitKopecks-categorySpent(ops,c.id,month)})) }
export function goalMonths(goal:Goal) { if(!goal.monthlyKopecks||goal.monthlyKopecks<=0)return null; return Math.ceil(Math.max(0,goal.targetKopecks-goal.balanceKopecks)/goal.monthlyKopecks) }
export function recommendedSaving(incomeKopecks:number,percent=10) { return Math.round(incomeKopecks*percent/100) }
export function earlyRepayment(loan:Loan,extraKopecks:number) { const monthlyRate=loan.annualRatePercent/100/12; const payment=loan.paymentKopecks; const balance=Math.max(0,loan.balanceKopecks-extraKopecks); if(!monthlyRate||payment<=balance*monthlyRate)return {months:null,interestKopecks:null}; const months=Math.ceil(Math.log(payment/(payment-balance*monthlyRate))/Math.log(1+monthlyRate)); return {months,interestKopecks:Math.round(payment*months-balance)} }
export function envelopeBalance(envelopes:Envelope[], kind:Envelope['kind']) { return envelopes.filter(e=>e.kind===kind).reduce((sum,e)=>sum+e.balanceKopecks,0) }
export function protectedMoney(envelopes:Envelope[]) { return envelopeBalance(envelopes,'required')+envelopeBalance(envelopes,'reserve')+envelopeBalance(envelopes,'debt') }
export function plannedEverydayMoney(envelopes:Envelope[]) { return envelopeBalance(envelopes,'living')+envelopeBalance(envelopes,'flexible') }
export function unallocatedMoney(accounts:Account[], envelopes:Envelope[]) { return availableMoney(accounts)-envelopes.reduce((sum,e)=>sum+e.balanceKopecks,0) }
export function planStatus(accounts:Account[], envelopes:Envelope[], obligations:Obligation[], startsOn?:string, endsOn?:string) {
 const required= envelopeBalance(envelopes,'required')
 const debt= envelopeBalance(envelopes,'debt')
 const dueItems=obligations.filter(o=>!o.paid&&(startsOn&&endsOn?o.dueDate>=startsOn&&o.dueDate<endsOn:isInMonth(o.dueDate)))
 const billDue=dueItems.filter(o=>o.kind==='bill').reduce((sum,o)=>sum+o.amountKopecks,0)
 const debtDue=dueItems.filter(o=>o.kind==='loan').reduce((sum,o)=>sum+o.amountKopecks,0)
 const due=billDue+debtDue
 const obligationGap=Math.max(0,billDue-required)+Math.max(0,debtDue-debt)
 const allocationGap=Math.max(0,-unallocatedMoney(accounts,envelopes))
 const gap=Math.max(obligationGap,allocationGap)
 return { dueKopecks:due, requiredKopecks:required, debtKopecks:debt, billDueKopecks:billDue, debtDueKopecks:debtDue, gapKopecks:gap, isReady:Boolean(startsOn&&endsOn)&&gap===0 }
}
