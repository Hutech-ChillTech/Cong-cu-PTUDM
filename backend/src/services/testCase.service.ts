import { Prisma } from "@prisma/client";
import TestCaseRepository from "../repositories/testcase.repository";

class TestCaseService {
  private readonly testCaseRepository: TestCaseRepository;
  constructor(testCaseRepository: TestCaseRepository) {
    this.testCaseRepository = testCaseRepository;
  }

  async getAllTestCase() {
    try {
      const testCases = await this.testCaseRepository.getAll();
      return testCases;
    } catch (error) {
      throw error;
    }
  }

  async getTestCaseById(id: string) {
    try {
      const testCase = await this.testCaseRepository.getById(id);
      return testCase;
    } catch (error) {
      throw error;
    }
  }

  async getTestCaseByLessonId(lessonId: string) {
    try {
      const testCases = await this.testCaseRepository.getTestCaseByLessonId(
        lessonId
      );
      return testCases;
    } catch (error) {
      throw error;
    }
  }

  async createTestCase(data: Prisma.TestCasesCreateInput) {
    try {
      return await this.testCaseRepository.create(data);
    } catch (error) {
      throw error;
    }
  }

  async updateTestCase(id: string, data: Prisma.TestCasesUpdateInput) {
    try {
      return await this.testCaseRepository.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteTestCase(id: string) {
    try {
      return await this.testCaseRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }
}

export default TestCaseService;
