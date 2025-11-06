import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Question {
  id: string;
  orderIndex: number;
  text: string;
}

export interface StartTestResponse {
  attemptId: string;
  version: string;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  answer: number; // 1-5
}

export interface SaveAnswersRequest {
  answers: Answer[];
}

export interface ScoreBreakdown {
  scoreE: number;
  scoreI: number;
  scoreS: number;
  scoreN: number;
  scoreT: number;
  scoreF: number;
  scoreJ: number;
  scoreP: number;
}

export interface TestResult {
  attemptId: string;
  personalityType: string;
  typeName: string;
  typeDescription: string;
  completedAt: string;
  scores: ScoreBreakdown;
  hasCompleteReport: boolean;
}

export interface AttemptHistory {
  id: string;
  completedAt: string;
  personalityType: string;
  typeName: string;
  hasCompleteReport: boolean;
  shareCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly API_URL = `${environment.apiUrl}/api/test`;

  constructor(private http: HttpClient) {}

  startTest(): Observable<StartTestResponse> {
    return this.http.post<StartTestResponse>(`${this.API_URL}/start`, {});
  }

  getQuestions(version: string = 'latest'): Observable<StartTestResponse> {
    return this.http.get<StartTestResponse>(`${this.API_URL}/questions?version=${version}`);
  }

  saveAnswers(attemptId: string, answers: Answer[]): Observable<any> {
    return this.http.patch(`${this.API_URL}/attempts/${attemptId}/answers`, { answers });
  }

  submitTest(attemptId: string): Observable<TestResult> {
    return this.http.post<TestResult>(`${this.API_URL}/attempts/${attemptId}/submit`, {});
  }

  getResult(attemptId: string): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.API_URL}/attempts/${attemptId}/result`);
  }

  getHistory(page: number = 1, pageSize: number = 20): Observable<AttemptHistory[]> {
    return this.http.get<AttemptHistory[]>(`${this.API_URL}/history?page=${page}&pageSize=${pageSize}`);
  }
}
