from langchain_community.document_loaders import PyMuPDFLoader

from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings,AzureChatOpenAI

from langchain_community.vectorstores import FAISS
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate


class Docqa:
    def __init__(self, file_paths):
        # self.question = question
        self.retriever = self._get_documents_knowledge_base(file_paths)
        self.llm = AzureChatOpenAI(
            azure_endpoint="https://azureadople.openai.azure.com/",
            api_key="d40171e5187047b3928b8f3f63900e4a",
            api_version="2023-07-01-preview",azure_deployment="GPT-4o"
        )

    def _extract_text_from_pdfs(self, file_paths):
        try:
            docs = []
            loaders = [PyMuPDFLoader(file_obj) for file_obj in file_paths]
            for loader in loaders:
                docs.extend(loader.load())
            return docs
    
        except Exception as e:
            print(f"Error in _extract_text_from_pdfs: {e}")
            return []

    def _split_text_into_chunks(self, text):
        try:
            text_splitter = CharacterTextSplitter(separator="\n", chunk_size=6000, chunk_overlap=0, length_function=len)
            chunks = text_splitter.split_documents(text)
            return chunks
        except Exception as e:
            print(f"Error in _split_text_into_chunks: {e}")
            return []

    def _create_vector_store_from_text_chunks(self, text_chunks):
        try:
            embeddings = AzureOpenAIEmbeddings(
                azure_deployment="text-embedding-3-large",api_key="d40171e5187047b3928b8f3f63900e4a",api_version="2023-07-01-preview",azure_endpoint="https://azureadople.openai.azure.com/"
            )
            vectorstore = FAISS.from_documents(documents=text_chunks, embedding=embeddings)
            return vectorstore.as_retriever()
        except Exception as e:
            print(f"Error in _create_vector_store_from_text_chunks: {e}")
            return None

    def _get_documents_knowledge_base(self, file_paths):
        try:
            pdf_docs = [file_path for file_path in file_paths]
            raw_text = self._extract_text_from_pdfs(pdf_docs)
            text_chunks = self._split_text_into_chunks(raw_text)
            vectorstore = self._create_vector_store_from_text_chunks(text_chunks)
            return vectorstore
        except Exception as e:
            print(f"Error in _get_documents_knowledge_base: {e}")
            return None

    def main(self, question):
        try:
            system_prompt = (
                "Use the given context to answer the question. "
                "If you don't know the answer, say you don't know. "
                "Use three sentence maximum and keep the answer concise. "
                "Context: {context}.if context is not provided, generaly answer to the question."
            )
            prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", system_prompt),
                    ("human", "{input}"),
                ]
            )
            question_answer_chain = create_stuff_documents_chain(self.llm, prompt)
            chain = create_retrieval_chain(self.retriever, question_answer_chain)

            response = chain.invoke({"input": question})
            return response
        except Exception as e:
            print(f"Error in main: {e}")
            return None
